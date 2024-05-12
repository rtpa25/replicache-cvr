"use client";

import { Button, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

import { api } from "~/lib/api";

import Loading from "~/app/(auth)/login/loading";
import { useUser } from "~/hook/user-user";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState("");

  const { data, isLoading } = useUser();

  const loginMutation = useMutation({
    mutationFn: api.createUser,
    onError(error) {
      console.error(error);
    },
    onSuccess() {
      router.push("/");
    },
  });

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loginMutation.mutateAsync({ email });
  };

  if (data) {
    router.push("/");
    return null;
  }

  return (
    <main className="flex justify-center items-center h-screen">
      <div className="bg-slate-900 md:w-1/2 w-full lg:w-1/3 p-4 m-4 rounded-md shadow-2xl shadow-slate-900 flex flex-col gap-y-8">
        {isLoading && <Loading />}
        {!isLoading && !data && (
          <>
            <div className="flex flex-col gap-y-2">
              <h1 className="font-bold text-4xl">Login</h1>
              <p>Please login to continue.</p>
            </div>
            <form onSubmit={submitHandler} className="flex flex-col items-end gap-y-4">
              <Input
                type="email"
                variant={"bordered"}
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button color="primary" type="submit" isLoading={loginMutation.isPending}>
                Login
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
};

export default Login;
