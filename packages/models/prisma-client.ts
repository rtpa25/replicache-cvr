import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prismaClient = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prismaClient;

export type TransactionalPrismaClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export default prismaClient;
export * from "@prisma/client";
