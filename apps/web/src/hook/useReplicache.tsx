import { useAbly } from "ably/react";
import { nanoid } from "nanoid";
import * as React from "react";
import { Replicache } from "replicache";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { type MutatorType } from "@repo/models";

import { env } from "~/env";
import { useUser } from "~/hook/user-user";

type State = {
  rep: Replicache<M<MutatorType.CLIENT>> | null;
};

type Actions = {
  setRep: (rep: Replicache<M<MutatorType.CLIENT>>) => void;
};

const useReplicacheStore = create<State & Actions>()(
  immer((set) => ({
    rep: null,
    setRep: (rep) => set({ rep }),
  })),
);

export const useReplicache = () => {
  return { rep: useReplicacheStore((state) => state.rep) };
};

export const useLoadReplicache = () => {
  const { data } = useUser();
  const user = data?.user;
  const { rep, setRep } = useReplicacheStore((state) => state);
  const ably = useAbly();

  React.useEffect(() => {
    if (!user?.id) return;

    const iid = nanoid();

    const r = new Replicache({
      name: user.id,
      licenseKey: env.NEXT_PUBLIC_REPLICACHE_LICENSE_KEY,
      mutators: clientMutators(user.id),
      schemaVersion: env.NEXT_PUBLIC_SCHEMA_VERSION ?? "1",
      pushURL: `${env.NEXT_PUBLIC_API_URL}/replicache/push?instance=${iid}`,
      pullURL: `${env.NEXT_PUBLIC_API_URL}/replicache/pull?instance=${iid}`,
    });

    setRep(r);

    return () => {
      void r.close();
    };

    // ignoring router because of unstability
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRep, user?.id]);

  React.useEffect(() => {
    if (!rep || !user?.id) return;
    const channel = ably.channels.get(`replicache:${user.id}`);
    channel.subscribe(() => {
      void rep?.pull();
    });

    return () => {
      const channel = ably.channels.get(`replicache:${user.id}`);
      channel.unsubscribe();
    };
  }, [rep, ably.channels, user?.id]);
};
