import type { PullResponseOKV1 } from 'replicache';
import { z } from 'zod';

export type PullResponseOK<Cookie> = Omit<PullResponseOKV1, 'cookie'> & {
  cookie: Cookie;
};

export const mutationSchema = z.object({
  clientID: z.string(),
  id: z.number(),
  name: z.string(),
  args: z.any(),
});

export const pushRequestSchema = z.object({
  pushVersion: z.literal(1),
  profileID: z.string(),
  clientGroupID: z.string(),
  mutations: z.array(mutationSchema),
});
