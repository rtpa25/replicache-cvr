import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import * as React from "react";

interface TodoModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  heading: "Add Todo" | "Edit Todo";
  onPrimaryAction: () => void;
}

export default function TodoModal({
  isOpen,
  onOpenChange,
  heading,
  onPrimaryAction,
}: TodoModalProps) {
  const primaryActionHandler = () => {
    onPrimaryAction();
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} placement={"auto"} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{heading}</ModalHeader>
            <ModalBody>
              <form className="flex flex-col items-end gap-y-4">
                <Input variant={"bordered"} label="Todo" />
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={primaryActionHandler} variant="solid">
                Add
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
