import { z } from "zod";

export const userCreateSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});
export type UserCreateType = z.infer<typeof userCreateSchema>;
