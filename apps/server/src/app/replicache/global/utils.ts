import {
  replicacheClient,
  replicacheClientGroup,
  replicacheSpace,
} from '@replivent/db/schema';
import { PgTransaction } from '../../types';
import { InferModel, eq } from 'drizzle-orm';

export async function getGlobalVersion(tx: PgTransaction): Promise<number> {
  const [space] = await tx.select().from(replicacheSpace);
  if (!space) {
    throw new Error('No "replicache_space" found');
  }
  return space.version;
}

export async function setGlobalVersion(
  tx: PgTransaction,
  version: number
): Promise<void> {
  await tx.update(replicacheSpace).set({
    version,
  });
}

export async function getClient(
  tx: PgTransaction,
  clientId: string
): Promise<InferModel<typeof replicacheClient> | undefined> {
  const [client] = await tx
    .select()
    .from(replicacheClient)
    .where(eq(replicacheClient.id, clientId));
  return client;
}

export async function createClient(
  tx: PgTransaction,
  clientId: string,
  clientGroupId: string,
  lastModifiedVersion: number
): Promise<InferModel<typeof replicacheClient>> {
  const [client] = await tx
    .insert(replicacheClient)
    .values({
      id: clientId,
      clientGroupId,
      lastModifiedVersion,
      lastMutationId: 0,
    })
    .returning();
  if (!client) {
    throw new Error('Insert invariant violation on "replicache_client"');
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
    .update(replicacheClient)
    .set({
      lastModifiedVersion,
      lastMutationId,
    })
    .where(eq(replicacheClient.id, clientId))
    .returning();
}

export async function getClientGroup(
  tx: PgTransaction,
  clientGroupId: string,
  userId: string
): Promise<InferModel<typeof replicacheClientGroup> | undefined> {
  const [clientGroup] = await tx
    .select()
    .from(replicacheClientGroup)
    .where(eq(replicacheClientGroup.id, clientGroupId));

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
): Promise<InferModel<typeof replicacheClientGroup>> {
  const [insertResult] = await tx
    .insert(replicacheClientGroup)
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
