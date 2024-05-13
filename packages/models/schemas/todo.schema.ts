import { type Prisma } from "@prisma/client";
import { z } from "zod";

export type TodoType = Prisma.TodoGetPayload<object>;

export const todoCreateSchema = z.object({
  id: z.string().nanoid(),
  text: z.string().min(1).max(100),
});
export type TodoCreateType = z.infer<typeof todoCreateSchema>;

export const todoUpdateSchema = z.object({
  id: z.string().nanoid(),
  text: z.string().min(1).max(100),
  completed: z.boolean(),
});
export type TodoUpdateType = z.infer<typeof todoUpdateSchema>;

export const todoDeleteSchema = z.object({
  id: z.string().nanoid(),
});
export type TodoDeleteType = z.infer<typeof todoDeleteSchema>;
