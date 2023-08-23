import { environment } from 'apps/server/src/environments/environment';
import { drizzle } from 'drizzle-orm/node-postgres';
import { RouteHandler } from 'fastify';
import { Pool } from 'pg';
import { z } from 'zod';
import { getClientGroup, getGlobalVersion } from './utils';
import { PgTransaction } from '../../types';
import { globalReplicacheClient } from '@replivent/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import { PullResponseOK } from '../types';
import { getAllChanges } from './diff';
import { getAuth } from '../../auth';

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
    const sinceVersion = pull.cookie ?? 0;

    const result = await db.transaction(
      async (tx): Promise<PullResponseOK<number>> => {
        // Validates that user owns clientGroup
        await getClientGroup(tx, pull.clientGroupID, userId);

        const [nextVersion, lastMutationIDChanges, patch] = await Promise.all([
          getGlobalVersion(tx),
          getLastMutationIdChanges(tx, pull.clientGroupID, sinceVersion),
          getAllChanges(tx, sinceVersion),
        ]);

        return {
          cookie: nextVersion,
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
  sinceVersion: number
): Promise<Record<string, number>> {
  const clients = await tx
    .select()
    .from(globalReplicacheClient)
    .where(
      and(
        eq(globalReplicacheClient.clientGroupId, clientGroupId),
        gt(globalReplicacheClient.lastModifiedVersion, sinceVersion)
      )
    );

  const result: Record<string, number> = {};
  for (const r of clients) {
    result[r.id] = r.lastMutationId;
  }
  return result;
}
