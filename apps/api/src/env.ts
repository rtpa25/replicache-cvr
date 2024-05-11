import { z } from "zod";

const envSchema = z.object({
  API_SERVER_PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "staging"]).optional(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
