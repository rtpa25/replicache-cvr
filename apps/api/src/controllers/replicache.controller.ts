import { type NextFunction, type Request, type RequestHandler, type Response } from "express";

import {
  AppError,
  CVR,
  cvrCache,
  Prisma,
  prismaClient,
  type PullCookie,
  type PullRequestType,
  type PullResponseOKV1,
  type PushRequestType,
} from "@repo/models";

import { logger } from "@repo/lib";

import { serverMutators } from "../mutators";
import { ClientService } from "../services/client.service";
import { ClientGroupService } from "../services/client-group.service";
import { ReplicacheService } from "../services/replicache.service";
import { TodoService } from "../services/todo.service";

class ReplicacheController {
  push: RequestHandler = async (
    req: Request<object, object, PushRequestType["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user.id;
      const push = req.body;

      const trxResponse = await prismaClient.$transaction(
        async (tx) => {
          //#region  //*=========== Init transactional services ===========
          const clientGroupService = new ClientGroupService(tx);
          const clientService = new ClientService(tx);
          //#endregion  //*======== Init transactional services ===========

          for (const mutation of push.mutations) {
            const baseClientGroup = await clientGroupService.createIfNotExists({
              id: push.clientGroupID,
              userId,
            });
            const baseClient = await clientService.createIfNotExists({
              id: mutation.clientID,
              clientGroupId: push.clientGroupID,
            });
            const nextClientVersion = baseClientGroup.clientGroupVersion + 1;
            const nextMutationId = baseClient.lastMutationId + 1;

            //#region  //*=========== Mutation id checks ===========
            if (mutation.id < nextMutationId) {
              logger.debug(`Skipping mutation ${mutation.id} because it has already been applied`);
              continue;
            }

            if (mutation.id > nextMutationId) {
              logger.error(
                `Mutation ${mutation.id} is too far in the future, expected ${nextMutationId}`,
              );
              break;
            }
            //#endregion  //*======== Mutation id checks ===========

            const mutationName = mutation.name as keyof typeof serverMutators;
            const mutator = serverMutators[mutationName];
            if (!mutator) {
              logger.error(`Unknown mutation ${mutation.name}`);
              throw new Error(`Unknown mutation ${mutation.name}`);
            }
            try {
              const args = mutation.args;
              await mutator({
                args: args as never,
                userId,
                tx,
              });
            } catch (error: unknown) {
              logger.error(error);
              if (error instanceof AppError) {
                throw error;
              }
              throw new AppError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to apply mutation: ${mutation.name} to the server, due to an internal error. Please try again later.`,
              });
            } finally {
              //#region  //*=========== Update client+clientGroup ===========
              await clientGroupService.update({
                id: push.clientGroupID,
                clientGroupVersion: nextClientVersion,
              });
              await clientService.update({
                id: mutation.clientID,
                lastModifiedClientVersion: nextClientVersion,
                lastMutationId: nextMutationId,
              });
              //#endregion  //*======== Update client+clientGroup ===========
            }
          }
          return true;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000, // default 2000ms
          timeout: 6000, // default 5000ms
        },
      );

      if (!trxResponse) {
        throw new AppError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to push data to the server, due to an internal error. Please try again later.",
        });
      }

      res.status(200).json({
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
            "Failed to pull data from the server, due to an internal error. Please try again later.",
        }),
      );
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

      const trxResponse = await prismaClient.$transaction(
        async (tx) => {
          const clientGroupService = new ClientGroupService(tx);
          const clientService = new ClientService(tx);
          const todoService = new TodoService(tx);

          const baseClientGroup = await clientGroupService.createIfNotExists({
            id: clientGroupID,
            userId,
          });
          const clientChanges = await clientService.findManyByClientGroupId({
            clientGroupId: clientGroupID,
            sinceClientVersion: baseCVR.clientVersion,
          });

          const todosMeta = await todoService.findMeta({ userId });

          const nextCVR = CVR.generateCVR({
            clientVersion: baseClientGroup.clientGroupVersion,
            todosMeta,
          });

          const todoPuts = CVR.getPutsSince(nextCVR.todos, baseCVR.todos);

          let previousCVRVersion = baseClientGroup.cvrVersion;
          if (previousCVRVersion === null) {
            if (cookie) previousCVRVersion = cookie.order;
            else previousCVRVersion = 0;
          }
          const nextClientGroup = await clientGroupService.update({
            id: baseClientGroup.id,
            cvrVersion: previousCVRVersion + 1,
          });

          const todos = await todoService.findMany({ ids: todoPuts });

          const todoDels = CVR.getDelsSince(nextCVR.todos, baseCVR.todos);

          const responseCookie: PullCookie = {
            clientGroupID,
            order: nextClientGroup.cvrVersion!, // taken from update request, so we can be sure that it's there
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
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5000, // default 2000ms
          timeout: 6000, // default 5000ms
        },
      );

      const { patch, clientChanges, nextCVR, responseCookie } = trxResponse;
      await cvrCache.setCVR(responseCookie.clientGroupID, responseCookie.order, nextCVR);

      const body: PullResponseOKV1 = {
        cookie: responseCookie,
        lastMutationIDChanges: Object.fromEntries(
          clientChanges.map((c) => [c.id, c.lastMutationId]),
        ),
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
