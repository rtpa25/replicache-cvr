import { type Prisma } from "@prisma/client";
import { z } from "zod";

export const userCreateInputSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});
export type UserCreateInputType = z.infer<typeof userCreateInputSchema>;

export type UserCreateOutputType = {
  user: Prisma.UserGetPayload<{
    select: {
      id: true;
    };
  }>;
};

export type UserGetOutputType = {
  user: Prisma.UserGetPayload<{
    select: {
      id: true;
    };
  }>;
};
