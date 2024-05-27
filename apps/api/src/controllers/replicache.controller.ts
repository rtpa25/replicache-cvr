import { type NextFunction, type Request, type RequestHandler, type Response } from "express";

import {
  AppError,
  CVR,
  CVRCache,
  type PullCookie,
  type PullRequestType,
  type PullResponseOKV1,
  type PushRequestType,
  transact,
} from "@repo/models";

import { logger, redis } from "@repo/lib";

import { ClientService } from "../services/client.service";
import { ClientGroupService } from "../services/client-group.service";
import { ReplicacheService } from "../services/replicache.service";
import { TodoService } from "../services/todo.service";
import { sendPoke } from "../utils/poke";

const cvrCache = new CVRCache(redis);

class ReplicacheController {
  push: RequestHandler = async (
    req: Request<object, object, PushRequestType["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    const userId = req.user.id;
    try {
      const push = req.body;
      for (const mutation of push.mutations) {
        try {
          await ReplicacheService.processMutation({
            clientGroupID: push.clientGroupID,
            errorMode: false,
            mutation,
            userId,
          });
        } catch (error) {
          await ReplicacheService.processMutation({
            clientGroupID: push.clientGroupID,
            errorMode: true,
            mutation,
            userId,
          });
        }
      }
      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      logger.error(error);
      return next(
        new AppError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to push data to the server, due to an internal error. Please try again later.",
        }),
      );
    } finally {
      await sendPoke({ userId });
    }
  };

  pull: RequestHandler = async (
    req: Request<object, object, PullRequestType["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user.id;
      const { cookie, clientGroupID } = req.body;
      // 1. Get the base CVR and the previous CVR from the cache
      const { baseCVR, previousCVR } = await cvrCache.getBaseCVR(clientGroupID, cookie);

      const trxResponse = await transact(async (tx) => {
        // 2. Init services inside the transaction
        //#region  //*=========== init services ===========
        const clientGroupService = new ClientGroupService(tx);
        const clientService = new ClientService(tx);
        const todoService = new TodoService(tx);
        //#endregion  //*======== init services ===========

        // 3. Get the base client group
        const baseClientGroup = await clientGroupService.getById({
          id: clientGroupID,
          userId,
        });

        // 4. Get the all todos and clients (just id and rowVersion) from the database
        // this needs to be done for all entities that are part of the sync
        const [todosMeta, clientsMeta] = await Promise.all([
          todoService.findMeta({ userId }),
          clientService.findMeta({ clientGroupId: clientGroupID }),
        ]);

        // 5. Generate the next CVR
        const nextCVR = CVR.generateCVR({
          clientsMeta,
          todosMeta,
        });

        // 6. Get the puts and dels for todos
        // this needs to be done for all entities that are part of the sync
        const todoPuts = CVR.getPutsSince(nextCVR.todos, baseCVR.todos); // puts refers to ones that are new or updated
        const todoDels = CVR.getDelsSince(nextCVR.todos, baseCVR.todos); // dels refers to ones that are deleted

        // 7. Check if prevCVR existed inside redis now there are no puts or dels so we can return null
        if (previousCVR && todoDels.length === 0 && todoPuts.length === 0) {
          return null;
        }

        // 8. Get the actual todos data from the database for all the puts
        const todos = await todoService.findMany({ ids: todoPuts });

        // 9. Get the puts for clients and compute the changes for each client
        const clientPuts = CVR.getPutsSince(nextCVR.clients, baseCVR.clients);
        const clientChanges: Record<string, number> = {}; // {clientid: lastMutationId}
        for (const id of clientPuts) {
          const c = nextCVR.clients.get(id);
          clientChanges[id] = c ? c.rowVersion : 0;
        }

        // 10. Upsert the client group with the new CVR version
        const previousCVRVersion = cookie?.order ?? baseClientGroup.cvrVersion;
        const nextClientGroup = await clientGroupService.upsert({
          id: baseClientGroup.id,
          userId,
          cvrVersion: Math.max(previousCVRVersion, baseClientGroup.cvrVersion) + 1,
        });

        // 11. Generate the new response cookie
        const responseCookie: PullCookie = {
          clientGroupID,
          order: nextClientGroup.cvrVersion,
        };

        // 12. Generate the patch for Replicache to sync the indexDB of the client group
        const patch = ReplicacheService.genPatch({
          previousCVR,
          TODO: {
            data: todos,
            dels: todoDels,
          },
        });

        return {
          nextCVR,
          responseCookie,
          patch,
          clientChanges,
        };
      });

      if (trxResponse === null) {
        return res.status(200).json({
          cookie,
          lastMutationIDChanges: {},
          patch: [],
        });
      }

      const { patch, clientChanges, nextCVR, responseCookie } = trxResponse;
      // 13. Set the new CVR in the cache
      await cvrCache.setCVR(responseCookie.clientGroupID, responseCookie.order, nextCVR);
      // 14. Delete the old CVR from the cache if it existed
      if (cookie) {
        await cvrCache.delCVR(clientGroupID, cookie.order);
      }

      const body: PullResponseOKV1 = {
        cookie: responseCookie,
        lastMutationIDChanges: clientChanges,
        patch,
      };

      return res.status(200).json(body);
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      logger.error(error);
      return next(
        new AppError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to pull data from the server, due to an internal error. Please try again later.",
        }),
      );
    }
  };
}

export const replicacheController = new ReplicacheController();
