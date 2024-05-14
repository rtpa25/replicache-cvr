"use client";

import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Ably from "ably";
import { AblyProvider } from "ably/react";
import * as React from "react";

import { getBaseUrl } from "~/lib/get-base-url";

const ablyClient = new Ably.Realtime({
  authUrl: `${getBaseUrl()}/api/ably-get-token`,
  closeOnUnload: false,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <AblyProvider client={ablyClient}>
      <NextUIProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NextUIProvider>
    </AblyProvider>
  );
}
