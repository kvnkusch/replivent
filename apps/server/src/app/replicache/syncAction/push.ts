import { z } from 'zod';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { environment } from '../../../environments/environment';
import { RouteHandler } from 'fastify';
import { PgTransaction } from '../../types';
import {
  createClient,
  createClientGroup,
  getClient,
  getClientGroup,
  updateClient,
} from './utils';
import { getAuth } from '../../auth';
import { mutationSchema, pushRequestSchema } from '../types';
import { mutate } from './mutations';

export const handlePush: RouteHandler = async (req, reply) => {
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

  const t0 = Date.now();
  try {
    const push = pushRequestSchema.parse(req.body);

    // Iterate each mutation in the push.
    for (const mutation of push.mutations) {
      const t1 = Date.now();

      // All transaction MUST be use an isolation level of SERIALIZABLE
      try {
        await db.transaction(
          (tx) =>
            processMutation(tx, userId, push.clientGroupID, mutation, null),
          {
            isolationLevel: 'serializable',
          }
        );
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown Error';
        console.error('Caught error from mutation', mutation, e);
        await db.transaction(
          (tx) =>
            processMutation(
              tx,
              userId,
              push.clientGroupID,
              mutation,
              errorMessage
            ),
          {
            isolationLevel: 'serializable',
          }
        );
      }

      console.log('Processed mutation in', Date.now() - t1);
    }

    console.log('Processed all mutations in', Date.now() - t0);

    reply.status(200).send('OK');

    // TODO: Send poke to relevant clients
    // await sendPoke();
  } catch (e) {
    console.error(e);
    // TODO: Additional error cases here
    reply.status(500).send('Internal Server Error');
  }
};

// TODO: Is it preferable to process all mutations in one transaction or one per?
// One per transaction is probably a bit slower but also allows partial failures?
// TODO: What should be returned here??
const processMutation = async (
  tx: PgTransaction,
  userId: string,
  clientGroupId: string,
  mutation: z.infer<typeof mutationSchema>,
  error: string | null
) => {
  // TODO: Should this use "FOR UPDATE"?
  const clientGroup = await ensureClientGroup(tx, clientGroupId, userId);

  const client = await ensureClient(
    tx,
    mutation.clientID,
    clientGroup.id,
    mutation.id
  );

  const nextMutationId = client.lastMutationId + 1;
  // Skip mutation if it has already been processed
  if (mutation.id < nextMutationId) {
    return;
  }
  if (mutation.id > nextMutationId) {
    throw new Error(`Invalid mutation.id "${mutation.id}" found`);
  }

  if (error === null) {
    const { syncId } = await mutate(mutation, { tx }, undefined);
    await updateClient(tx, mutation.clientID, nextMutationId, syncId);
  } else {
    // TODO: You can store state here in the database to return to clients to
    // provide additional info about errors.
    console.log(
      'Handling error from mutation',
      JSON.stringify(mutation),
      error
    );
    await updateClient(
      tx,
      mutation.clientID,
      nextMutationId,
      client.lastSyncId
    );
  }
};

async function ensureClientGroup(
  tx: PgTransaction,
  clientGroupId: string,
  userId: string
) {
  const clientGroup = await getClientGroup(tx, clientGroupId, userId);
  if (clientGroup) {
    return clientGroup;
  }

  return createClientGroup(tx, clientGroupId, userId);
}

async function ensureClient(
  tx: PgTransaction,
  clientId: string,
  clientGroupID: string,
  mutationId: number
) {
  const client = await getClient(tx, clientId);
  if (client) {
    if (client.clientGroupId !== clientGroupID) {
      throw new Error('Cannot access clientId from different group');
    }
    return client;
  }

  if (mutationId !== 1) {
    throw new Error(
      'Could not find client record, but mutationId !== 1 so it should already exist'
    );
  }

  return createClient(tx, clientId, clientGroupID);
}
