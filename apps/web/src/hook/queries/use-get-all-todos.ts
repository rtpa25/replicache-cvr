import { useSubscribe } from "replicache-react";

import { type TodoType } from "@repo/models";

import { useReplicache } from "~/hook/use-replicache";
import { TodoManager } from "~/managers/todo.manager";

export function useGetAllTodos(userId: string) {
  const { rep } = useReplicache();
  return useSubscribe(
    rep,
    async (tx) => {
      return TodoManager.getallTodos({ tx });
    },
    {
      default: [] as TodoType[],
      dependencies: [userId],
    },
  );
}
