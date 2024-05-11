"use client";

import { Button, useDisclosure } from "@nextui-org/react";

import Todo from "~/app/components/todo";
import TodoModal from "~/app/components/todoModal";

export default function Page(): JSX.Element {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const addTodo = () => {
    onOpen();
  };

  return (
    <main className="max-w-screen-lg mx-auto p-6 flex flex-col gap-y-12">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-4xl">Todos</h1>
        <Button color="primary" variant="shadow" onClick={addTodo}>
          Add Todo
        </Button>
      </div>

      <ul className="flex flex-col gap-y-4">
        <Todo />
      </ul>

      <TodoModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        heading="Add Todo"
        onPrimaryAction={() => {
          console.info("Add Todo");
        }}
      />
    </main>
  );
}
