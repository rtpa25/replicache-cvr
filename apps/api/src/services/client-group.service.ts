import { AppError, type Prisma, prismaClient } from "@repo/models";
import { type TransactionalPrismaClient } from "@repo/models";

/**
 * @description this class is to be used for transactional operations on the clientGroup table
 */
export class ClientGroupService {
  constructor(private tx: TransactionalPrismaClient = prismaClient) {}

  async getById({ id, userId }: { id: string; userId: string }): Promise<
    Prisma.ClientGroupGetPayload<{
      select: {
        id: true;
        userId: true;
        cvrVersion: true;
      };
    }>
  > {
    const clientGroup = await this.tx.clientGroup.findUnique({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        userId: true,
        cvrVersion: true,
      },
    });
    if (!clientGroup) {
      return {
        id,
        userId,
        cvrVersion: 0,
      };
    }
    if (clientGroup.userId !== userId) {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to access this client group",
      });
    }
    return clientGroup;
  }

  async upsert({ id, userId, cvrVersion }: { id: string; userId: string; cvrVersion: number }) {
    return await this.tx.clientGroup.upsert({
      where: {
        id,
        userId,
      },
      update: {
        lastModified: new Date(),
        cvrVersion,
      },
      create: {
        id,
        userId,
        cvrVersion,
        lastModified: new Date(),
      },
      select: {
        id: true,
        cvrVersion: true,
      },
    });
  }
}

/**
 * @description this constant is an instance of the ClientGroupService class, and should be used for non transactional operations
 */
export const clientGroupService = new ClientGroupService();
