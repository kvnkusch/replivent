import { z } from 'zod';

// TODO: Worth trying to keep these in line with database schema?
// De-coupling has flexibility benefits

export const locationSchema = z.object({
  name: z.string(),
});

export const launchPadSchema = z.object({
  name: z.string(),
  locationId: z.string(),
});

export const rocketModelSchema = z.object({
  name: z.string(),
  maxPassengerCapacity: z.number().nullable(),
  weightLimitLbs: z.number(),
});

export const rocketSchema = z.object({
  modelId: z.string(),
  serialNumber: z.string(),
});

export const personSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.string(),
  phoneNumber: z.string().nullable(),
  email: z.string().nullable(),
});

export const rocketTripSchema = z.object({
  rocketId: z.string(),
  start: z.string(),
  startLaunchPadId: z.string(),
  end: z.string(),
  endLaunchPadId: z.string(),
  passengerCapacity: z.number().nullable(),
});

export const rocketTripPassengerSchema = z.object({
  rocketTripId: z.string(),
  personId: z.string(),
});

export const personHealthCheckSchema = z.object({
  date: z.string(),
  personId: z.string(),
  weight_lbs: z.number(),
  status: z.enum(['healthy', 'at_risk', 'unhealthy']),
});

const complianceRuleAttributeSchema = z.enum([
  'rocket_trip_start_minus_passenger_health_check_in_days',
  'percent_healthy_passengers',
  'percent_at_risk_passengers',
  'percent_unhealthy_passengers',
  'passenger_age',
]);

const opSchema = z.enum(['eq', 'ne', 'ge', 'gt', 'le', 'lt']);

export const locationComplianceRuleSchema = z.object({
  locationId: z.string(),
  attribute: complianceRuleAttributeSchema,
  op: opSchema,
  value: z.number(),
});

export const rocketTripComplianceRuleSchema = z.object({
  rocketTripId: z.string(),
  attribute: complianceRuleAttributeSchema,
  op: opSchema,
  value: z.number(),
});
