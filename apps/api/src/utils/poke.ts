import { ably } from "@repo/lib";

export async function sendPoke({ userId }: { userId: string }) {
  ably.channels.get(`replicache:${userId}`).publish({});
}
