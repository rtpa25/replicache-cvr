import { type Redis, redis, TIME_WINDOWS } from "@repo/lib";

import { type ClientViewMetadata, CVR } from "./cvr";
import { type PullCookie } from "./schemas";

type RedisCVR = {
  todos: Record<string, ClientViewMetadata>[];
  clientVersion: number;
};

export class CVRCache {
  constructor(private redis: Redis) {}

  static makeCVRKey(clientGroupID: string, order: number) {
    return `${clientGroupID}/${order}`;
  }

  static convertRedisObjectToMap(data: Record<string, ClientViewMetadata>[]) {
    return new Map<string, ClientViewMetadata>(
      data.map((item) => Object.entries(item)[0]) as [string, ClientViewMetadata][],
    );
  }

  static convertMapToRedisObject(map: Map<string, ClientViewMetadata>) {
    return Array.from(map).map(([key, value]) => ({ [key]: value }));
  }

  public async getBaseCVR(
    clientGroupID: string,
    cookie: PullCookie,
  ): Promise<{
    baseCVR: CVR;
    previousCVR?: CVR;
  }> {
    let previousCVR: CVR | undefined;

    if (typeof cookie === "object" && cookie !== null && typeof cookie.order === "number") {
      /**
       * Redis CVR might be empty if we push a new schema,
       * that's why we make it to return Partial.
       *
       * Say we add a new model, and the client has an old CVR,
       * that new model will not be in the CVR and break the app, so we need to create a fallback
       */
      const redisCVR = (await this.redis.get(
        CVRCache.makeCVRKey(clientGroupID, cookie.order),
      )) as Partial<RedisCVR>;

      if (redisCVR) {
        const cvr = new CVR({
          // fallback to empty map in case we have a new model
          todos: redisCVR.todos ? CVRCache.convertRedisObjectToMap(redisCVR.todos) : new Map(),
          clientVersion: redisCVR.clientVersion ?? 0,
        });

        previousCVR = cvr;
      }
    }

    const baseCVR =
      previousCVR ??
      new CVR({
        todos: new Map<string, ClientViewMetadata>(),
        clientVersion: 0,
      });

    return { baseCVR, previousCVR };
  }

  public async setCVR(clientGroupID: string, order: number, cvr: CVR) {
    const redisCVR: RedisCVR = {
      todos: CVRCache.convertMapToRedisObject(cvr.todos),
      clientVersion: cvr.clientVersion,
    };

    await this.redis.set(CVRCache.makeCVRKey(clientGroupID, order), JSON.stringify(redisCVR));
    await this.redis.expire(CVRCache.makeCVRKey(clientGroupID, order), TIME_WINDOWS.ONE_HOUR * 12);
  }
}

export const cvrCache = new CVRCache(redis);