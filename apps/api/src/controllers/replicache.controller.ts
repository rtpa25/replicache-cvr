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
      const { baseCVR, previousCVR } = await cvrCache.getBaseCVR(clientGroupID, cookie);

      const trxResponse = await transact(async (tx) => {
        const clientGroupService = new ClientGroupService(tx);
        const clientService = new ClientService(tx);
        const todoService = new TodoService(tx);

        const [baseClientGroup, todosMeta, clientsMeta] = await Promise.all([
          clientGroupService.getClientGroupById({
            id: clientGroupID,
            userId,
          }),
          todoService.findMeta({ userId }),
          clientService.findMeta({ clientGroupId: clientGroupID }),
        ]);

        const nextCVR = CVR.generateCVR({
          clientsMeta,
          todosMeta,
        });

        const todoPuts = CVR.getPutsSince(nextCVR.todos, baseCVR.todos);
        const todoDels = CVR.getDelsSince(nextCVR.todos, baseCVR.todos);

        if (previousCVR && todoDels.length === 0 && todoPuts.length === 0) {
          return null;
        }

        const todos = await todoService.findMany({ ids: todoPuts });

        const clientPuts = CVR.getPutsSince(nextCVR.clients, baseCVR.clients);
        const clientChanges: Record<string, number> = {}; // {clientid: lastMutationId}
        for (const id of clientPuts) {
          const c = nextCVR.clients.get(id);
          clientChanges[id] = c ? c.rowVersion : 0;
        }

        const previousCVRVersion = cookie?.order ?? baseClientGroup.cvrVersion;
        const nextClientGroup = await clientGroupService.upsert({
          id: baseClientGroup.id,
          userId,
          cvrVersion: Math.max(previousCVRVersion, baseClientGroup.cvrVersion) + 1,
        });

        const responseCookie: PullCookie = {
          clientGroupID,
          order: nextClientGroup.cvrVersion,
        };

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
      await cvrCache.setCVR(responseCookie.clientGroupID, responseCookie.order, nextCVR);
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
