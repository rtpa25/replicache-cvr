import Ably from "ably";

import { env } from "../env";

export const ably = new Ably.Rest(env.ABLY_API_KEY);
