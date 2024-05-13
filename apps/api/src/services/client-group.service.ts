import {
  type ClientGroupCreateIfNotExistsType,
  type ClientGroupUpdateArgs,
  prismaClient,
} from "@repo/models";
import { type TransactionalPrismaClient } from "@repo/models";

/**
 * @description this class is to be used for transactional operations on the clientGroup table
 */
export class ClientGroupService {
  constructor(private tx: TransactionalPrismaClient = prismaClient) {}

  async createIfNotExists({ id, userId }: ClientGroupCreateIfNotExistsType) {
    return this.tx.clientGroup.upsert({
      where: {
        id,
        userId,
      },
      create: {
        id,
        userId,
      },
      update: {},
    });
  }

  async update({ id, clientGroupVersion, cvrVersion }: ClientGroupUpdateArgs) {
    return this.tx.clientGroup.update({
      where: {
        id,
      },
      data: {
        clientGroupVersion,
        cvrVersion,
      },
    });
  }
}

/**
 * @description this constant is an instance of the ClientGroupService class, and should be used for non transactional operations
 */
export const clientGroupService = new ClientGroupService();
