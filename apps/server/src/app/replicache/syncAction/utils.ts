import {
  syncActionReplicacheClient,
  syncActionReplicacheClientGroup,
} from '@replivent/db/schema';
import { PgTransaction } from '../../types';
import { InferModel, eq } from 'drizzle-orm';

export async function getClient(
  tx: PgTransaction,
  clientId: string
): Promise<InferModel<typeof syncActionReplicacheClient> | undefined> {
  const [client] = await tx
    .select()
    .from(syncActionReplicacheClient)
    .where(eq(syncActionReplicacheClient.id, clientId));
  return client;
}

export async function createClient(
  tx: PgTransaction,
  clientId: string,
  clientGroupId: string
): Promise<InferModel<typeof syncActionReplicacheClient>> {
  const [client] = await tx
    .insert(syncActionReplicacheClient)
    .values({
      id: clientId,
      clientGroupId,
      lastMutationId: 0,
      lastSyncId: 0,
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
  lastSyncId: number
): Promise<void> {
  await tx
    .update(syncActionReplicacheClient)
    .set({
      lastMutationId,
      lastSyncId,
    })
    .where(eq(syncActionReplicacheClient.id, clientId))
    .returning();
}

export async function getClientGroup(
  tx: PgTransaction,
  clientGroupId: string,
  userId: string
): Promise<InferModel<typeof syncActionReplicacheClientGroup> | undefined> {
  const [clientGroup] = await tx
    .select()
    .from(syncActionReplicacheClientGroup)
    .where(eq(syncActionReplicacheClientGroup.id, clientGroupId));

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
): Promise<InferModel<typeof syncActionReplicacheClientGroup>> {
  const [insertResult] = await tx
    .insert(syncActionReplicacheClientGroup)
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
