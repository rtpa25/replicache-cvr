import { env } from "~/env";

export const getBaseUrl = () => {
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : `https://${env.NEXT_PUBLIC_VERCEL_URL}`;
};
