import { type ClientGroup } from "@prisma/client";
import { type Optional } from "utility-types";

export type ClientGroupUpdateArgs = Omit<
  Optional<ClientGroup, "clientGroupVersion" | "cvrVersion">,
  "userId" | "lastModified"
>;

export type ClientGroupCreateIfNotExistsType = {
  id: string;
  userId: string;
};
