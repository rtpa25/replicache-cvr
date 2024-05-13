import { type Mutator, type MutatorTypes } from "./mutator.model";
import {
  type TodoCreateType,
  type TodoDeleteType,
  type TodoUpdateType,
} from "../schemas/todo.schema";

export type TodoMutators<Type = MutatorTypes> = {
  todoCreate: Mutator<Type, TodoCreateType>;
  todoUpdate: Mutator<Type, TodoUpdateType>;
  todoDelete: Mutator<Type, TodoDeleteType>;
};
