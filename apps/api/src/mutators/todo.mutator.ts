import {
  AppError,
  type MutatorType,
  todoCreateSchema,
  todoDeleteSchema,
  type TodoMutators,
  todoUpdateSchema,
} from "@repo/models";

import { TodoService } from "../services/todo.service";

export const todoMutators: TodoMutators<MutatorType.SERVER> = {
  async todoCreate(body) {
    const { args, tx, userId } = body;

    const parsed = todoCreateSchema.safeParse(args);
    if (!parsed.success) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: `Invalid request body, ${parsed.error.message}`,
      });
    }

    const todoService = new TodoService(tx);
    await todoService.create({ args: parsed.data, userId });
  },
  async todoUpdate(body) {
    const { args, tx, userId } = body;

    const parsed = todoUpdateSchema.safeParse(args);
    if (!parsed.success) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: `Invalid request body, ${parsed.error.message}`,
      });
    }

    const todoService = new TodoService(tx);
    await todoService.update({ args, userId });
  },
  async todoDelete(body) {
    const { args, tx, userId } = body;

    const parsed = todoDeleteSchema.safeParse(args);
    if (!parsed.success) {
      throw new AppError({
        code: "BAD_REQUEST",
        message: `Invalid request body, ${parsed.error.message}`,
      });
    }

    const todoService = new TodoService(tx);
    await todoService.delete({ args, userId });
  },
};
