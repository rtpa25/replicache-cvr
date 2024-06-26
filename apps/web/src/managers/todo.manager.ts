import {
  IDB_KEY,
  type ReadTransaction,
  type TodoCreateType,
  type TodoType,
  type TodoUpdateType,
} from "@repo/models";

import { normalizeReplicacheData } from "~/lib/replicache";

export class TodoManager {
  static createTodo(args: TodoCreateType & { userId: string }) {
    const todo: TodoType = {
      id: args.id,
      title: args.text,
      rowVersion: 0,
      completed: false,
      userId: args.userId,
    };
    return todo;
  }

  static async getTodoById({ id, tx }: { id: string; tx: ReadTransaction }) {
    const todo = (await tx.get(IDB_KEY.TODO({ id: id }))) as TodoType | undefined;
    return todo;
  }

  static updateTodo({ oldTodo, args }: { oldTodo: TodoType; args: TodoUpdateType }) {
    return {
      ...oldTodo,
      title: args.text,
      completed: args.completed,
    } as TodoType;
  }

  static async getallTodos({ tx }: { tx: ReadTransaction }) {
    const _todos = await tx
      .scan({
        prefix: IDB_KEY.TODO({}),
      })
      .entries()
      .toArray();

    const todos = normalizeReplicacheData<TodoType>(_todos);
    return todos;
  }
}
