import { pgTable, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const syncActionReplicacheClientGroup = pgTable(
  'sync_action_replicache_client_group',
  {
    id: uuid('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow(),
    userId: uuid('user_id').notNull(),
    // TODO: workspaceId?
  }
);

export const syncActionReplicacheClient = pgTable(
  'sync_action_replicache_client',
  {
    id: uuid('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow(),
    clientGroupId: uuid('client_group_id')
      .notNull()
      .references(() => syncActionReplicacheClientGroup.id),
    lastMutationId: integer('last_mutation_id').notNull(),
    lastSyncId: integer('last_sync_id').notNull(),
  }
);
