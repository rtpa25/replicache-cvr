"use client";

import Ably from "ably";
import { AblyProvider } from "ably/react";

import { api } from "~/lib/api";

const ablyClient = new Ably.Realtime({
  authCallback: (_tokenParams, callback) => {
    api
      .getSocketAuthToken()
      .then((tokenRequest) => callback(null, tokenRequest))
      .catch((error) => callback(error, null));
  },
  /**
   * Auto-connect in the browser because we don't have cookies in the next-server
   * and we don't want ably to fire authCallback without cookies
   * @see https://github.com/ably/ably-js/issues/1742
   */
  autoConnect: typeof window !== "undefined",
  closeOnUnload: false,
});

export const AblyContextProvider = ({ children }: { children: React.ReactNode }) => {
  return <AblyProvider client={ablyClient}>{children}</AblyProvider>;
};
