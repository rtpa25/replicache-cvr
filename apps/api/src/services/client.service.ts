import {
  type ClientCreateArgs,
  type ClientCreateIfNotExistsType,
  type ClientFindManyByClientGroupIdType,
  type ClientUpdateArgs,
  prismaClient,
  type TransactionalPrismaClient,
} from "@repo/models";

/**
 * @description this class is to be used for transactional operations on the client table
 */
export class ClientService {
  constructor(private tx: TransactionalPrismaClient = prismaClient) {}

  async update(args: ClientUpdateArgs) {
    return this.tx.client.update({
      where: {
        id: args.id,
      },
      data: {
        lastMutationId: args.lastMutationId,
        lastModifiedClientVersion: args.lastModifiedClientVersion,
      },
    });
  }

  async createMany(args: ClientCreateArgs[]) {
    return this.tx.client.createMany({
      data: args,
    });
  }

  async findManyByIds(ids: string[]) {
    return this.tx.client.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async createIfNotExists({ id, clientGroupId }: ClientCreateIfNotExistsType) {
    return this.tx.client.upsert({
      where: {
        id,
        clientGroupId,
      },
      create: {
        id,
        clientGroupId,
      },
      update: {},
    });
  }

  async findManyByClientGroupId({
    clientGroupId,
    sinceClientVersion,
  }: ClientFindManyByClientGroupIdType) {
    return this.tx.client.findMany({
      where: {
        clientGroupId,
        lastModifiedClientVersion: {
          gt: sinceClientVersion,
        },
      },
    });
  }
}

/**
 * @description this constant is an instance of the ClientService class, and should be used for non transactional operations
 * on the client table
 */
export const clientService = new ClientService();
