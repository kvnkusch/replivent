import {
  globalReplicacheClient,
  globalReplicacheClientGroup,
  globalReplicacheSpace,
} from '@replivent/db/schema';
import { PgTransaction } from '../../types';
import { InferModel, eq } from 'drizzle-orm';

export async function getGlobalVersion(tx: PgTransaction): Promise<number> {
  const [space] = await tx.select().from(globalReplicacheSpace);
  if (!space) {
    throw new Error('No "globalReplicache_space" found');
  }
  return space.version;
}

export async function setGlobalVersion(
  tx: PgTransaction,
  version: number
): Promise<void> {
  await tx.update(globalReplicacheSpace).set({
    version,
  });
}

export async function getClient(
  tx: PgTransaction,
  clientId: string
): Promise<InferModel<typeof globalReplicacheClient> | undefined> {
  const [client] = await tx
    .select()
    .from(globalReplicacheClient)
    .where(eq(globalReplicacheClient.id, clientId));
  return client;
}

export async function createClient(
  tx: PgTransaction,
  clientId: string,
  clientGroupId: string,
  lastModifiedVersion: number
): Promise<InferModel<typeof globalReplicacheClient>> {
  const [client] = await tx
    .insert(globalReplicacheClient)
    .values({
      id: clientId,
      clientGroupId,
      lastModifiedVersion,
      lastMutationId: 0,
    })
    .returning();
  if (!client) {
    throw new Error('Insert invariant violation on "global_replicache_client"');
  }
  return client;
}

export async function updateClient(
  tx: PgTransaction,
  clientId: string,
  lastMutationId: number,
  lastModifiedVersion: number
): Promise<void> {
  await tx
    .update(globalReplicacheClient)
    .set({
      lastModifiedVersion,
      lastMutationId,
    })
    .where(eq(globalReplicacheClient.id, clientId))
    .returning();
}

export async function getClientGroup(
  tx: PgTransaction,
  clientGroupId: string,
  userId: string
): Promise<InferModel<typeof globalReplicacheClientGroup> | undefined> {
  const [clientGroup] = await tx
    .select()
    .from(globalReplicacheClientGroup)
    .where(eq(globalReplicacheClientGroup.id, clientGroupId));

  if (clientGroup && clientGroup.userId !== userId) {
    // TODO: Better error, e.g. Auth?
    throw new Error();
  }

  return clientGroup;
}

export async function createClientGroup(
  tx: PgTransaction,
  clientGroupId: string,
  userId: string
): Promise<InferModel<typeof globalReplicacheClientGroup>> {
  const [insertResult] = await tx
    .insert(globalReplicacheClientGroup)
    .values({
      id: clientGroupId,
      userId,
    })
    .returning();
  if (!insertResult) {
    throw new Error("Shouldn't be possible");
  }
  return insertResult;
}
