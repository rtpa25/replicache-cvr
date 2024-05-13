import { type M, type MutatorType } from "@repo/models";

import { todoMutators } from "./todo.mutator";

export const serverMutators: M<MutatorType.SERVER> = {
  ...todoMutators,
};
