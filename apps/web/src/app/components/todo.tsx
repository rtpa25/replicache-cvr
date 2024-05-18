import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@nextui-org/react";
import * as React from "react";

import { type TodoType } from "@repo/models";

import TodoModal from "~/app/components/todoModal";
import { useReplicache } from "~/hook/use-replicache";

interface TodoProps {
  todo: TodoType;
}

export default function Todo({ todo }: TodoProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { rep } = useReplicache();

  return (
    <>
      <Card>
        <CardBody className="flex flex-row justify-between items-center">
          <div className="flex items-center">
            <Dropdown>
              <DropdownTrigger>
                <Button variant="light">::</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="new" onClick={onOpen}>
                  Edit Todo
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  onClick={() => {
                    if (!rep) return;
                    rep.mutate.todoDelete({ id: todo.id });
                  }}
                >
                  Delete Todo
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <p>{todo.title}</p>
          </div>
          <Checkbox
            isSelected={todo.completed}
            onValueChange={() => {
              if (!rep) return;
              rep.mutate.todoUpdate({
                id: todo.id,
                completed: !todo.completed,
              });
            }}
          />
        </CardBody>
      </Card>
      <TodoModal
        heading="Edit Todo"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        defaultText={todo.title}
        onPrimaryAction={(text) => {
          if (!rep) return;
          rep.mutate.todoUpdate({
            id: todo.id,
            text,
          });
        }}
      />
    </>
  );
}
