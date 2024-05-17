"use client";

import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

import { AblyContextProvider } from "~/providers/create-ably-provider";
import { ReplicacheProvider } from "~/providers/create-replicache-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <AblyContextProvider>
      <NextUIProvider>
        <QueryClientProvider client={queryClient}>
          <ReplicacheProvider>{children}</ReplicacheProvider>
        </QueryClientProvider>
      </NextUIProvider>
    </AblyContextProvider>
  );
}
