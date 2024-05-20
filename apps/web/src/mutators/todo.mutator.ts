import {
  IDB_KEY,
  type MutatorType,
  normalizeToReadonlyJSON,
  type TodoMutators,
} from "@repo/models";

import { TodoManager } from "~/managers/todo.manager";

export const clientTodoMutators: (userId: string) => TodoMutators<MutatorType.CLIENT> = (
  userId,
) => ({
  async todoCreate(tx, args) {
    const todo = TodoManager.createTodo({
      ...args,
      userId,
    });

    await tx.set(IDB_KEY.TODO({ id: args.id }), normalizeToReadonlyJSON(todo));
  },
  async todoDelete(tx, args) {
    const todo = await TodoManager.getTodoById({
      id: args.id,
      tx,
    });

    if (todo === undefined) {
      throw new Error(`Todo with id ${args.id} not found`);
    }

    await tx.del(IDB_KEY.TODO({ id: args.id }));
  },
  async todoUpdate(tx, args) {
    const todo = await TodoManager.getTodoById({
      id: args.id,
      tx,
    });

    if (todo === undefined) {
      throw new Error(`Todo with id ${args.id} not found`);
    }

    // should never happen, as in every user's indexDB resides data that only that user has access to
    if (todo.userId !== userId) {
      throw new Error(`Todo with id ${args.id} not found`);
    }

    const updatedTodo = TodoManager.updateTodo({
      args,
      oldTodo: todo,
    });
    await tx.set(IDB_KEY.TODO({ id: args.id }), normalizeToReadonlyJSON(updatedTodo));
  },
});
