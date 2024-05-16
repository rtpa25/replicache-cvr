import { useLoadReplicache } from "~/hook/useReplicache";

// Separated to avoid re-rendering the entire app
export const ReplicacheProvider = ({ children }: { children: React.ReactNode }) => {
  useLoadReplicache();

  return <div>{children}</div>;
};
