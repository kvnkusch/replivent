import { pgTable, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

// Global Strategy:

export const replicacheSpace = pgTable('replicache_space', {
  id: uuid('id').primaryKey().defaultRandom(),
  version: integer('version').notNull(),
});

export const replicacheClientGroup = pgTable('replicache_client_group', {
  // TODO: Does this need to be a string, rather than uuid, based on what replicache sends?
  id: uuid('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  userId: uuid('user_id').notNull(),
});

export const replicacheClient = pgTable('replicache_client', {
  // TODO: Does this need to be a string, rather than uuid, based on what replicache sends?
  id: uuid('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  clientGroupId: uuid('client_group_id')
    .notNull()
    .references(() => replicacheClientGroup.id),
  lastMutationId: integer('last_mutation_id').notNull(),
  lastModifiedVersion: integer('last_modified_version').notNull(),
});

// Row-version Strategy:

// export const replicacheClientGroup = pgTable('replicache_client_group', {
//   // TODO: Does this need to be a string, rather than uuid, based on what replicache sends?
//   id: uuid('id').primaryKey(),
//   createdAt: timestamp('created_at').defaultNow(),
//   userId: uuid('user_id').notNull(),
//   clientVersion: integer('client_version').notNull(),
//   // TODO: Figure out what is going on with this
//   cvrVersion: integer('client_version').notNull(),
// });

// export const replicacheClient = pgTable('replicache_client', {
//   // TODO: Does this need to be a string, rather than uuid, based on what replicache sends?
//   id: uuid('id').primaryKey(),
//   createdAt: timestamp('created_at').defaultNow(),
//   clientGroupId: uuid('client_group_id')
//     .notNull()
//     .references(() => replicacheClientGroup.id),
//   lastMutationId: integer('last_mutation_id').notNull(),
//   clientVersion: integer('client_version').notNull(),
// });
