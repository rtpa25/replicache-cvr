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

import TodoModal from "~/app/components/todoModal";

export default function Todo() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
                <DropdownItem key="new" onClick={() => onOpen()}>
                  Edit Todo
                </DropdownItem>
                <DropdownItem key="delete" className="text-danger" color="danger">
                  Delete Todo
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <p>Make beautiful websites regardless of your design experience.</p>
          </div>
          <Checkbox />
        </CardBody>
      </Card>
      <TodoModal
        heading="Edit Todo"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onPrimaryAction={() => {
          console.info("Edit Todo");
        }}
      />
    </>
  );
}
