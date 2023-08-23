import { environment } from 'apps/server/src/environments/environment';
import { drizzle } from 'drizzle-orm/node-postgres';
import { RouteHandler } from 'fastify';
import { Pool } from 'pg';
import { z } from 'zod';
import { getClientGroup } from './utils';
import { PgTransaction } from '../../types';
import { syncAction, syncActionReplicacheClient } from '@replivent/db/schema';
import { and, eq, gt, asc } from 'drizzle-orm';
import { PullResponseOK } from '../types';
import { getAuth } from '../../auth';
import type { PatchOperation, PullResponseOKV1 } from 'replicache';

// Was getting error from client when using an object as the cookie. Could JSON stringify I guess?
// const cookieSchema = z.object({
//   lastSyncId: z.number(),
// });

// type Cookie = z.infer<typeof cookieSchema>;

const pullRequestSchema = z.object({
  pullVersion: z.literal(1),
  profileID: z.string(),
  clientGroupID: z.string(),
  cookie: z.number().nullable(),
  schemaVersion: z.string(),
});

export const handlePull: RouteHandler = async (req, reply) => {
  // TODO: Should this be a different object for every request, or no?
  const pool = new Pool({
    connectionString: environment.DATABASE_URL,
  });
  const db = drizzle(pool);

  let userId: string;
  const auth = getAuth(req);
  if (!auth.success) {
    reply.status(401).send('Unauthenticated');
    return;
  }
  userId = auth.data;

  try {
    const pull = pullRequestSchema.parse(req.body);
    const lastSyncId = pull.cookie ?? 0;

    const result = await db.transaction(
      async (tx): Promise<PullResponseOK<number>> => {
        // Validates that user owns clientGroup
        await getClientGroup(tx, pull.clientGroupID, userId);

        const [lastMutationIDChanges, { patch, latestSyncId }] =
          await Promise.all([
            getLastMutationIdChanges(tx, pull.clientGroupID, lastSyncId),
            getPatchAndLatestSyncId(tx, lastSyncId),
          ]);

        return {
          cookie: latestSyncId,
          lastMutationIDChanges,
          patch,
        };
      },
      { isolationLevel: 'serializable' }
    );
    reply.status(200).send(result);
  } catch (e) {
    console.error(e);
    // TODO: Additional error cases here
    reply.status(500).send('Internal Server Error');
  }
};

async function getLastMutationIdChanges(
  tx: PgTransaction,
  clientGroupId: string,
  lastSyncId: number
): Promise<Record<string, number>> {
  const clients = await tx
    .select()
    .from(syncActionReplicacheClient)
    .where(
      and(
        eq(syncActionReplicacheClient.clientGroupId, clientGroupId),
        gt(syncActionReplicacheClient.lastSyncId, lastSyncId)
      )
    );

  const result: Record<string, number> = {};
  for (const r of clients) {
    result[r.id] = r.lastMutationId;
  }
  return result;
}

async function getPatchAndLatestSyncId(
  tx: PgTransaction,
  lastSyncId: number
): Promise<{ patch: PatchOperation[]; latestSyncId: number }> {
  const actionsSinceLastSync = await tx
    .select()
    .from(syncAction)
    .where(gt(syncAction.syncId, lastSyncId))
    .orderBy(asc(syncAction.syncId))
    .execute();

  let latestSyncId =
    actionsSinceLastSync[actionsSinceLastSync.length - 1]?.syncId;
  if (latestSyncId === undefined) {
    return {
      patch: [],
      latestSyncId: lastSyncId,
    };
  }

  const patchMap = new Map<string, PatchOperation>();
  for (const action of actionsSinceLastSync) {
    const key = `${action.modelName}/${action.modelId}`;
    if (action.type === 'insert' || action.type === 'update') {
      patchMap.set(key, {
        op: 'put',
        key,
        value: action.data,
      });
    }
    if (action.type === 'delete') {
      patchMap.set(key, {
        op: 'del',
        key,
      });
    }
  }

  return {
    patch: Array.from(patchMap.values()),
    latestSyncId,
  };
}
