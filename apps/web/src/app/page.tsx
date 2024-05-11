import { Button, Checkbox } from "@nextui-org/react";
import Image from "next/image";

export default function Page(): JSX.Element {
  return (
    <main>
      <h1>Welcome to web!</h1>
      <Image src="/next.svg" alt="Next.js Logo" width={200} height={200} />
      <Button>Click me</Button>
      <Checkbox className="bg-black p-2 h-2 w-2"></Checkbox>
    </main>
  );
}
