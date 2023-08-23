import { PgTransaction } from '../../types';
import {
  createMutate,
  replicacheMutationBase,
  mutationArgsSchemaMap,
  ServerMutators,
} from '@replivent/domain/schema';
import { rocketTrip, rocketTripPassenger } from '@replivent/db/schema';
import { eq } from 'drizzle-orm';

type Context = { tx: PgTransaction };
type Result = void;
type AddtlArgs = { nextVersion: number };

export const mutators: ServerMutators<
  Context,
  Result,
  AddtlArgs,
  typeof mutationArgsSchemaMap
> = {
  createTrip: async (
    { tx },
    {
      rocketId,
      rocketTripId,
      startLaunchPadId,
      endLaunchPadId,
      start,
      end,
      passengerCapacity,
    },
    { nextVersion }
  ) => {
    await tx.insert(rocketTrip).values({
      id: rocketTripId,
      rocketId,
      start,
      end,
      startLaunchPadId,
      endLaunchPadId,
      lastModifiedVersion: nextVersion,
      passengerCapacity,
    });
  },
  updateTrip: async (
    { tx },
    { rocketTripId, start, end, passengerCapacity },
    { nextVersion }
  ) => {
    await tx
      .update(rocketTrip)
      .set({
        start,
        end,
        lastModifiedVersion: nextVersion,
        passengerCapacity,
      })
      .where(eq(rocketTrip.id, rocketTripId));
  },
  deleteTrip: async ({ tx }, { rocketTripId }, { nextVersion }) => {
    await tx
      .update(rocketTrip)
      .set({
        deleted: true,
        lastModifiedVersion: nextVersion,
      })
      .where(eq(rocketTrip.id, rocketTripId));
  },
  reserveTrip: async (
    { tx },
    { rocketTripId, rocketTripPassengerId, personId },
    { nextVersion }
  ) => {
    await tx.insert(rocketTripPassenger).values({
      id: rocketTripPassengerId,
      rocketTripId,
      personId,
      lastModifiedVersion: nextVersion,
    });
  },
  unreserveTrip: async ({ tx }, { rocketTripPassengerId }, { nextVersion }) => {
    await tx
      .update(rocketTripPassenger)
      .set({
        deleted: true,
        lastModifiedVersion: nextVersion,
      })
      .where(eq(rocketTripPassenger.id, rocketTripPassengerId));
  },
};

export const mutate = createMutate(
  mutationArgsSchemaMap,
  replicacheMutationBase,
  mutators
);
