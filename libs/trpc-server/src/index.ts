import { initTRPC } from '@trpc/server';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { z } from 'zod';
import { eq, and, inArray } from 'drizzle-orm';
import superjson from 'superjson';

export type TrpcContext = {
  db: NodePgDatabase;
};

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const trpcRouter = t.router({});

export type TrpcRouter = typeof trpcRouter;

const pickOne = <T>(arr: T[]): T => {
  const item = arr[0];
  if (!item) {
    throw new Error('Cannot pick from empty array');
  }
  return item;
};
