import {
  AppError,
  type MutatorContext,
  prismaClient,
  type TodoCreateType,
  type TodoUpdateType,
} from "@repo/models";
import { type TransactionalPrismaClient } from "@repo/models";

/**
 * @description this class is to be used for transactional operations on the todo table
 */
export class TodoService {
  constructor(private tx: TransactionalPrismaClient = prismaClient) {}

  async create({ args: { id, text }, userId }: MutatorContext & { args: TodoCreateType }) {
    return this.tx.todo.create({
      data: {
        id,
        title: text,
        completed: false,
        rowVersion: 0,
        userId,
      },
    });
  }

  async update({
    args: { completed, text, id },
    userId,
  }: MutatorContext & { args: TodoUpdateType }) {
    const todo = await this.tx.todo.findUnique({
      where: {
        id,
      },
    });
    if (!todo) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Todo not found",
      });
    }
    if (todo?.userId !== userId) {
      throw new AppError({
        code: "FORBIDDEN",
        message: "You are not authorized to perform this operation",
      });
    }

    return this.tx.todo.update({
      where: {
        id,
      },
      data: {
        title: text,
        completed,
        rowVersion: todo.rowVersion + 1,
      },
    });
  }

  async delete({ args: { id }, userId }: MutatorContext & { args: { id: string } }) {
    const todo = await this.tx.todo.findUnique({
      where: {
        id,
      },
    });
    if (!todo) {
      throw new AppError({
        code: "NOT_FOUND",
        message: "Todo not found",
      });
    }
    if (todo?.userId !== userId) {
      throw new AppError({
        code: "FORBIDDEN",
        message: "You are not authorized to perform this operation",
      });
    }

    return this.tx.todo.delete({
      where: {
        id,
      },
    });
  }
}

/**
 * @description this constant is an instance of the todo class, and should be used for non transactional operations
 */
export const todoService = new TodoService();
