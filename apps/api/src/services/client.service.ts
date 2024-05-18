import {
  AppError,
  type ClientCreateArgs,
  type ClientCreateIfNotExistsType,
  type ClientUpdateArgs,
  type Prisma,
  prismaClient,
  type SearchResult,
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

  async getClientById({ id, clientGroupId }: { id: string; clientGroupId: string }): Promise<
    Prisma.ClientGetPayload<{
      select: {
        id: true;
        clientGroupId: true;
        lastMutationId: true;
      };
    }>
  > {
    const client = await this.tx.client.findUnique({
      where: {
        id,
        clientGroupId,
      },
      select: {
        id: true,
        clientGroupId: true,
        lastMutationId: true,
      },
    });
    if (!client) {
      return {
        id,
        clientGroupId,
        lastMutationId: 0,
      };
    }
    if (client.clientGroupId !== clientGroupId) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this client",
      });
    }
    return client;
  }

  async upsert({
    id,
    clientGroupId,
    lastMutationId,
  }: {
    id: string;
    clientGroupId: string;
    lastMutationId: number;
  }) {
    await this.tx.client.upsert({
      where: {
        id,
        clientGroupId,
      },
      create: {
        id,
        clientGroupId,
        lastMutationId,
      },
      update: {
        lastMutationId,
      },
      select: {
        id: true,
      },
    });
  }

  async findMeta({ clientGroupId }: { clientGroupId: string }): Promise<SearchResult[]> {
    const clients = await this.tx.client.findMany({
      where: {
        clientGroupId,
      },
      select: {
        id: true,
        lastMutationId: true,
      },
    });

    return clients.map((client) => ({
      id: client.id,
      rowVersion: client.lastMutationId,
    }));
  }
}

/**
 * @description this constant is an instance of the ClientService class, and should be used for non transactional operations
 * on the client table
 */
export const clientService = new ClientService();
