import { useLoadReplicache } from "~/hook/use-replicache";

export const ReplicacheProvider = ({ children }: { children: React.ReactNode }) => {
  useLoadReplicache();

  return <div>{children}</div>;
};
