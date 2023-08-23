import { pgTable, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const globalReplicacheSpace = pgTable('global_replicache_space', {
  id: uuid('id').primaryKey().defaultRandom(),
  version: integer('version').notNull(),
});

export const globalReplicacheClientGroup = pgTable(
  'global_replicache_client_group',
  {
    id: uuid('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow(),
    userId: uuid('user_id').notNull(),
  }
);

export const globalReplicacheClient = pgTable('global_replicache_client', {
  id: uuid('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  clientGroupId: uuid('client_group_id')
    .notNull()
    .references(() => globalReplicacheClientGroup.id),
  lastMutationId: integer('last_mutation_id').notNull(),
  lastModifiedVersion: integer('last_modified_version').notNull(),
});
