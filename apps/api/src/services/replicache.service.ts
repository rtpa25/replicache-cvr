import {
  AppError,
  type CVR,
  IDB_KEY,
  type IDBKeys,
  type MutationType,
  normalizeToReadonlyJSON,
  type PatchOperation,
  type TodoType,
  transact,
} from "@repo/models";

import { logger } from "@repo/lib";

import { ClientService } from "./client.service";
import { ClientGroupService } from "./client-group.service";
import { serverMutators } from "../mutators";

//! Make sure key have the same name as IDB_KEY
type GenPatchArgs = {
  previousCVR?: CVR;
  TODO: {
    data: TodoType[];
    dels: string[];
  };
};

export class ReplicacheService {
  static genPatch(args: GenPatchArgs): PatchOperation[] {
    const patch: PatchOperation[] = [];
    const { previousCVR, ...models } = args;

    if (previousCVR === undefined) {
      patch.push({ op: "clear" });
    }

    Object.entries(models).forEach(([_key, { data, dels }]) => {
      const key = _key as IDBKeys;

      dels.forEach((del) =>
        patch.push({
          op: "del",
          key: IDB_KEY[key]({ id: del }),
        }),
      );
      data.forEach((datum) =>
        patch.push({
          op: "put",
          key: IDB_KEY[key]({ id: datum.id }),
          value: normalizeToReadonlyJSON(datum),
        }),
      );
    });

    return patch;
  }

  static async processMutation({
    clientGroupID,
    errorMode,
    mutation,
    userId,
  }: {
    userId: string;
    clientGroupID: string;
    mutation: MutationType;
    errorMode: boolean;
  }): Promise<void> {
    await transact(async (tx) => {
      logger.info(
        `Processing mutation ${mutation.name} for user ${userId} in client group ${clientGroupID}`,
      );

      const clientGroupService = new ClientGroupService(tx);
      const clientService = new ClientService(tx);

      const baseClientGroup = await clientGroupService.getClientGroupById({
        id: clientGroupID,
        userId,
      });
      const baseClient = await clientService.getClientById({
        id: mutation.clientID,
        clientGroupId: clientGroupID,
      });

      const nextMutationId = baseClient.lastMutationId + 1;

      //#region  //*=========== Mutation id checks ===========
      if (mutation.id < nextMutationId) {
        logger.debug(`Skipping mutation ${mutation.id} because it has already been applied`);
        return;
      }

      if (mutation.id > nextMutationId) {
        logger.error(
          `Mutation ${mutation.id} is too far in the future, expected ${nextMutationId}`,
        );
        throw new AppError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Mutation ${mutation.id} is too far in the future, expected ${nextMutationId}`,
        });
      }
      //#endregion  //*======== Mutation id checks ===========

      if (!errorMode) {
        try {
          const mutationName = mutation.name as keyof typeof serverMutators;
          const mutator = serverMutators[mutationName];
          if (!mutator) {
            logger.error(`Unknown mutation ${mutation.name}`);
            throw new Error(`Unknown mutation ${mutation.name}`);
          }
          const args = mutation.args;
          await mutator({
            args,
            userId,
            tx,
          });
        } catch (error) {
          if (error instanceof AppError) {
            throw error;
          }
          logger.error(error);
          throw new AppError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to apply mutation: ${mutation.name} to the server, due to an internal error. Please try again later.`,
          });
        }
      }

      await Promise.all([
        clientGroupService.upsert({ ...baseClientGroup }),
        clientService.upsert({
          id: baseClient.id,
          clientGroupId: baseClient.clientGroupId,
          lastMutationId: nextMutationId,
        }),
      ]);
    });
  }
}
