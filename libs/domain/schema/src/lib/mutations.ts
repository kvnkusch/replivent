import { z } from 'zod';

// Simple version to fallback to

export const reserveTripSchema = z.object({
  clientID: z.string(),
  id: z.number(),
  name: z.literal('reserveTrip'),
  args: z.object({
    personId: z.string(),
    rocketTripId: z.string(),
  }),
});

export const createTripSchema = z.object({
  clientID: z.string(),
  id: z.number(),
  name: z.literal('createTrip'),
  args: z.object({
    rocketId: z.string(),
    startLaunchPadId: z.string(),
    endLaunchPadId: z.string(),
  }),
});

// export const mutationsSchema = z.union([reserveTripSchema, createTripSchema]);

export const mutationArgsSchemaMap = {
  reserveTrip: z.object({
    personId: z.string(),
    rocketTripId: z.string(),
  }),
  createTrip: z.object({
    rocketId: z.string(),
    startLaunchPadId: z.string(),
    endLaunchPadId: z.string(),
  }),
};
