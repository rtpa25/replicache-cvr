import { type Client } from "@prisma/client";

export type ClientCreateArgs = Omit<Client, "lastMutationId" | "updatedAt">;

export type ClientUpdateArgs = Omit<Client, "clientGroupId" | "updatedAt">;

export type ClientCreateIfNotExistsType = {
  id: string;
  clientGroupId: string;
};

export type ClientFindManyByClientGroupIdType = {
  clientGroupId: string;
  sinceClientVersion: number;
};
