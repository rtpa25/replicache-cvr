import { type ClientGroup } from "@prisma/client";
import { type Optional } from "utility-types";

export type ClientGroupUpdateArgs = Omit<
  Optional<ClientGroup, "cvrVersion">,
  "userId" | "lastModified"
>;
