import Image from "next/image";

export default function Page(): JSX.Element {
  return (
    <main>
      <h1>Welcome to web!</h1>
      <Image src="/next.svg" alt="Next.js Logo" width={200} height={200} />
    </main>
  );
}
