import { useQuery } from "@tanstack/react-query";

import { api } from "~/lib/api";

export function useUser() {
  return useQuery({
    queryFn: api.getUser,
    queryKey: ["user"],
    retry: 0,
  });
}
