import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  date,
  pgEnum,
  numeric,
} from 'drizzle-orm/pg-core';

const tableBase = {
  id: uuid('id').primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),

  // Global Strategy
  lastModifiedVersion: integer('last_modified_version').notNull(),
  deleted: boolean('deleted').default(false),

  // Row-version Strategy
  // ???
};

export const location = pgTable('location', {
  ...tableBase,
  name: text('name').notNull(),
});

export const launchPad = pgTable('launch_pad', {
  ...tableBase,
  name: text('name').notNull(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => location.id),
});

export const rocketModel = pgTable('rocket_model', {
  ...tableBase,
  name: text('name').notNull(),
  maxPassengerCapacity: integer('max_passenger_capacity'),
  weightLimitLbs: integer('weight_limit_lbs').notNull(),
});

export const rocket = pgTable('rocket', {
  ...tableBase,
  modelId: uuid('model_id')
    .notNull()
    .references(() => rocketModel.id),
  serialNumber: text('serial_number').notNull().unique(),
});

export const person = pgTable('person', {
  ...tableBase,
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  birthDate: date('birth_date'),
  phoneNumber: text('phone_number'),
  email: text('phone_number'),
});

export const rocketTrip = pgTable('rocket_trip', {
  ...tableBase,
  rocketId: uuid('rocket_id')
    .notNull()
    .references(() => rocket.id),
  start: timestamp('start', {
    mode: 'date',
  }).notNull(),
  startLaunchPadId: uuid('start_launch_pad_id')
    .notNull()
    .references(() => launchPad.id),
  end: timestamp('end', {
    mode: 'date',
  }).notNull(),
  endLaunchPadId: uuid('end_launch_pad_id')
    .notNull()
    .references(() => launchPad.id),
  passengerCapacity: integer('passenger_capacity'),
});

export const rocketTripPassenger = pgTable('rocket_trip_passenger', {
  ...tableBase,
  rocketTripId: uuid('rocket_trip_id')
    .notNull()
    .references(() => rocketTrip.id),
  personId: uuid('person_id')
    .notNull()
    .references(() => person.id),
});

export const healthCheckStatusEnum = pgEnum('health_check_status', [
  'healthy',
  'at_risk',
  'unhealthy',
]);

export const personHealthCheck = pgTable('person_health_check', {
  ...tableBase,
  date: date('date').notNull(),
  personId: uuid('person_id')
    .notNull()
    .references(() => person.id),
  weight_lbs: numeric('weight_lbs').notNull(),
  status: healthCheckStatusEnum('status').notNull(),
});

export const complianceRuleAttributeEnum = pgEnum('compliance_rule_attribute', [
  'rocket_trip_start_minus_passenger_health_check_in_days',
  'percent_healthy_passengers',
  'percent_at_risk_passengers',
  'percent_unhealthy_passengers',
  'passenger_age',
]);

export const opEnum = pgEnum('op', ['eq', 'ne', 'ge', 'gt', 'le', 'lt']);

export const locationComplianceRule = pgTable('location_compliance_rule', {
  ...tableBase,
  locationId: uuid('location_id')
    .notNull()
    .references(() => location.id),
  attribute: complianceRuleAttributeEnum('attribute').notNull(),
  op: opEnum('op').notNull(),
  value: numeric('value').notNull(),
});

export const rocketTripComplianceRule = pgTable('rocket_trip_compliance_rule', {
  ...tableBase,
  rocketTripId: uuid('rocket_trip_id')
    .notNull()
    .references(() => rocketTrip.id),
  attribute: complianceRuleAttributeEnum('attribute').notNull(),
  op: opEnum('op').notNull(),
  value: numeric('value').notNull(),
});

// Extra things that could be added:

// Cancelled trip (refunds?)
// Weather checks of locations
// Safety checks of rocket, launch pad
// Expenses
// Fuel (function of how far you are going + HARD MODE how much your passengers weight)
// Provisions
