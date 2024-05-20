import { Prisma, PrismaClient } from "@prisma/client";

import { logger } from "@repo/lib";

import { AppError } from "./err";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prismaClient =
  global.prisma ||
  new PrismaClient({
    log: ["query"],
  });
if (process.env.NODE_ENV !== "production") global.prisma = prismaClient;

export type TransactionalPrismaClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export default prismaClient;
export * from "@prisma/client";

export async function transact<T>(body: (tx: TransactionalPrismaClient) => Promise<T>): Promise<T> {
  for (let i = 0; i < 10; i++) {
    try {
      const r = await prismaClient.$transaction(body, {
        isolationLevel: "Serializable",
      });
      return r;
    } catch (error) {
      logger.error(`Transaction failed, retrying...${error}`);
      if (shouldRetryTxn(error)) {
        logger.debug(`Retrying transaction...`);
        continue;
      }
    }
  }
  throw new AppError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Tried 10 times, but transaction still failed",
  });
}

function shouldRetryTxn(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2002";
  }
  return false;
}
