"use client";

import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Ably, { ErrorInfo } from "ably";
import { AblyProvider } from "ably/react";
import * as React from "react";

import { api } from "~/lib/api";

import { ReplicacheProvider } from "~/providers/create-replicache-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [ablyClient] = React.useState(
    () =>
      new Ably.Realtime({
        authCallback: async (_data, callback) => {
          try {
            const tokenRequest = await api.getSocketAuthToken();

            callback(null, tokenRequest);
          } catch (error) {
            if (typeof error === "string" || error instanceof ErrorInfo) callback(error, null);
            callback(error as never, null);
          }
        },
        closeOnUnload: false,
        tls: true,
      }),
  );

  return (
    <AblyProvider client={ablyClient}>
      <NextUIProvider>
        <QueryClientProvider client={queryClient}>
          <ReplicacheProvider>{children}</ReplicacheProvider>
        </QueryClientProvider>
      </NextUIProvider>
    </AblyProvider>
  );
}
