"use client";

import { Button, useDisclosure } from "@nextui-org/react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useSubscribe } from "replicache-react";

import { type TodoType } from "@repo/models";

import Todo from "~/app/components/todo";
import TodoModal from "~/app/components/todoModal";
import { useReplicache } from "~/hook/use-replicache";
import { useUser } from "~/hook/user-user";
import { TodoManager } from "~/managers/todo.manager";

export default function Page() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const { rep } = useReplicache();

  const { data, isLoading } = useUser();

  const todos = useSubscribe(
    rep,
    async (tx) => {
      if (!data) return;
      return TodoManager.getallTodos({ tx, userId: data.user.id });
    },
    {
      default: [] as TodoType[],
      dependencies: [data],
    },
  );

  if (!data && !isLoading) {
    router.push("/login");
    return null;
  }

  return (
    <main className="max-w-screen-lg mx-auto p-6 flex flex-col gap-y-12">
      {data && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-4xl">Todos</h1>
            <Button color="primary" variant="shadow" onClick={onOpen}>
              Add Todo
            </Button>
          </div>

          <ul className="flex flex-col gap-y-4">
            {todos.map((todo) => (
              <Todo key={todo.id} todo={todo} />
            ))}
          </ul>

          <TodoModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            heading="Add Todo"
            onPrimaryAction={(text: string) => {
              if (!rep) return;
              rep.mutate.todoCreate({
                id: nanoid(),
                text,
              });
            }}
          />
        </>
      )}
    </main>
  );
}
