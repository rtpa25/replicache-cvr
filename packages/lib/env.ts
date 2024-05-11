import { z } from "zod";

const envSchema = z.object({
  REDIS_URI: z.string(),
  NODE_ENV: z.enum(["development", "staging", "production"]).optional(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
