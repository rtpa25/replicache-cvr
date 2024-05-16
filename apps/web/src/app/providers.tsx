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
            if (typeof error === "string" || error instanceof ErrorInfo) {
              callback(error, null);
            }
            callback(error as never, null);
          }
        },
        /**
         * Auto-connect in the browser because we don't have cookies in the next-server
         * and we don't want ably to fire authCallback without cookies
         * @see https://github.com/ably/ably-js/issues/1742
         */
        autoConnect: typeof window !== "undefined",
        closeOnUnload: false,
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
