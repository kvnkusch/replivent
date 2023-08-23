import { z } from 'zod';

export const mutationArgsSchemaMap = {
  createTrip: z.object({
    rocketTripId: z.string(),
    rocketId: z.string(),
    startLaunchPadId: z.string(),
    endLaunchPadId: z.string(),
    start: z.string(),
    end: z.string(),
    passengerCapacity: z.number().nullable(),
  }),
  updateTrip: z.object({
    rocketTripId: z.string(),
    start: z.string(),
    end: z.string(),
    passengerCapacity: z.number().nullable(),
  }),
  deleteTrip: z.object({
    rocketTripId: z.string(),
  }),
  reserveTrip: z.object({
    rocketTripPassengerId: z.string(),
    personId: z.string(),
    rocketTripId: z.string(),
  }),
  unreserveTrip: z.object({
    rocketTripPassengerId: z.string(),
  }),
};
