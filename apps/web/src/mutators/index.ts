import { type M, type MutatorType } from "@repo/models";

import { clientTodoMutators } from "~/mutators/todo.mutator";

export const clientMutators: (userId: string) => M<MutatorType.CLIENT> = (userId) => ({
  ...clientTodoMutators(userId),
});
