"use client";

import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React from "react";
const Login = () => {
  const router = useRouter();

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <main className="flex justify-center items-center h-screen">
      <div className="bg-slate-900 md:w-1/2 w-full lg:w-1/3 p-4 m-4 rounded-md shadow-2xl shadow-slate-900 flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-2">
          <h1 className="font-bold text-4xl">Login</h1>
          <p>Please login to continue.</p>
        </div>
        <form onSubmit={submitHandler} className="flex flex-col items-end gap-y-4">
          <Input type="email" variant={"bordered"} label="Email" />
          <Button color="primary" type="submit">
            Login
          </Button>
        </form>
      </div>
    </main>
  );
};

export default Login;
