/// <reference types="vite/client" />
import { z } from 'zod';

const envVariablesSchema = z.object({
  VITE_API_URL: z.string(),
  VITE_REPLICACHE_LICENSE_KEY: z.string(),
});

export const environment = envVariablesSchema.parse(import.meta.env);
