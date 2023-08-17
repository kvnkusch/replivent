import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  primaryKey,
} from 'drizzle-orm/pg-core';

// TODO: Fill out required data for each event
const tableBase = {
  id: uuid('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
};
