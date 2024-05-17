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
  onPrimaryAction: (text: string) => void;
  defaultText?: string;
}

export default function TodoModal({
  isOpen,
  onOpenChange,
  heading,
  onPrimaryAction,
  defaultText,
}: TodoModalProps) {
  const [text, setText] = React.useState(defaultText ?? "");

  const primaryActionHandler = () => {
    onPrimaryAction(text);
    setText("");
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} placement={"auto"} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{heading}</ModalHeader>
            <ModalBody>
              <Input
                variant={"bordered"}
                label="Todo"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                }}
              />
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
