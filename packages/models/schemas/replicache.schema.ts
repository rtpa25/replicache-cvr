import { z } from "zod";

const mutation = z.object({
  id: z.number(),
  clientID: z.string(),
  name: z.string(),
  args: z.any(),
});
export type MutationType = z.infer<typeof mutation>;

export const pushRequestSchema = z.object({
  body: z.object({
    profileID: z.string(),
    clientGroupID: z.string(),
    mutations: z.array(mutation),
    schemaVersion: z.string(),
  }),
});
export type PushRequestType = z.infer<typeof pushRequestSchema>;

const cookieSchema = z
  .object({
    order: z.number(),
    clientGroupID: z.string(),
  })
  .optional()
  .nullable();

export type PullCookie = z.infer<typeof cookieSchema>;

export const pullRequestSchema = z.object({
  body: z.object({
    profileID: z.string(),
    clientGroupID: z.string(),
    cookie: cookieSchema,
    schemaVersion: z.string(),
  }),
});
export type PullRequestType = z.infer<typeof pullRequestSchema>;
