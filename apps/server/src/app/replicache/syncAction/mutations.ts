import { PgTransaction } from '../../types';
import {
  createMutate,
  replicacheMutationBase,
  mutationArgsSchemaMap,
  ServerMutators,
} from '@replivent/domain/schema';
import { syncAction } from '@replivent/db/schema';
import { and, eq, desc } from 'drizzle-orm';

type Context = { tx: PgTransaction };
type Result = { syncId: number };
type AddtlArgs = undefined;

// TODO: Validation against materialized views

export const mutators: ServerMutators<
  Context,
  Result,
  AddtlArgs,
  typeof mutationArgsSchemaMap
> = {
  createTrip: async ({ tx }, { rocketTripId, ...data }) => {
    const [existing] = await tx
      .select()
      .from(syncAction)
      .where(
        and(
          eq(syncAction.modelName, 'RocketTrip'),
          eq(syncAction.modelId, rocketTripId)
        )
      )
      .orderBy(desc(syncAction.syncId))
      .limit(1);
    if (existing && existing.type !== 'delete') {
      throw new Error('RocketTrip already exists (insert)');
    }
    const [result] = await tx
      .insert(syncAction)
      .values({
        modelName: 'RocketTrip',
        modelId: rocketTripId,
        type: 'insert',
        data,
      })
      .returning({ syncId: syncAction.syncId });
    return result!;
  },
  updateTrip: async ({ tx }, { rocketTripId, ...data }) => {
    const [existing] = await tx
      .select()
      .from(syncAction)
      .where(
        and(
          eq(syncAction.modelName, 'RocketTrip'),
          eq(syncAction.modelId, rocketTripId)
        )
      )
      .orderBy(desc(syncAction.syncId))
      .limit(1);
    if (!existing) {
      throw new Error('RocketTrip not found (update)');
    }
    if (existing.type === 'delete') {
      throw new Error('Cannot act on deleted RocketTrip (update)');
    }
    const [result] = await tx
      .insert(syncAction)
      .values({
        modelName: 'RocketTrip',
        modelId: rocketTripId,
        type: 'update',
        data: {
          ...existing.data,
          ...data,
        },
      })
      .returning({ syncId: syncAction.syncId });
    return result!;
  },
  deleteTrip: async ({ tx }, { rocketTripId }) => {
    const [existing] = await tx
      .select()
      .from(syncAction)
      .where(
        and(
          eq(syncAction.modelName, 'RocketTrip'),
          eq(syncAction.modelId, rocketTripId)
        )
      )
      .orderBy(desc(syncAction.syncId))
      .limit(1);
    if (!existing) {
      throw new Error('RocketTrip not found (delete)');
    }
    if (existing.type === 'delete') {
      throw new Error('Cannot act on deleted RocketTrip (delete)');
    }
    const [result] = await tx
      .insert(syncAction)
      .values({
        modelName: 'RocketTrip',
        modelId: rocketTripId,
        type: 'delete',
        data: {},
      })
      .returning({ syncId: syncAction.syncId });
    return result!;
  },
  reserveTrip: async ({ tx }, { rocketTripPassengerId, ...data }) => {
    const [result] = await tx
      .insert(syncAction)
      .values({
        modelName: 'RocketTripPassenger',
        modelId: rocketTripPassengerId,
        type: 'insert',
        data,
      })
      .returning({ syncId: syncAction.syncId });
    return result!;
  },
  unreserveTrip: async ({ tx }, { rocketTripPassengerId }) => {
    const [result] = await tx
      .insert(syncAction)
      .values({
        modelName: 'RocketTripPassenger',
        modelId: rocketTripPassengerId,
        type: 'delete',
        data: {},
      })
      .returning({ syncId: syncAction.syncId });
    return result!;
  },
};

export const mutate = createMutate(
  mutationArgsSchemaMap,
  replicacheMutationBase,
  mutators
);
