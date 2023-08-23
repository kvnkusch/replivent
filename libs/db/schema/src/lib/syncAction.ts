import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  pgEnum,
  bigserial,
  index,
} from 'drizzle-orm/pg-core';

export const syncActionTypeEnum = pgEnum('sync_action_type', [
  'insert',
  'update',
  'delete',
]);

// TODO: Is this a sync_action instead?

export const syncAction = pgTable(
  'sync_action',
  {
    syncId: bigserial('id', {
      mode: 'number',
    }).primaryKey(),
    // TODO: Name / is this necessary?
    timestamp: timestamp('timestamp').defaultNow(),
    // TODO: mutationId or transactionId? Multiple mutations could happen per transaction in theory?
    // In general is this necessary?
    // mutationId: integer('mutation_id').notNull(),
    modelName: text('model_name').notNull(),
    modelId: uuid('model_id').notNull(),
    type: syncActionTypeEnum('type').notNull(),
    data: jsonb('data')
      .$type<{
        // TODO: Specify type here. Should runtime validation ever happen?
        // In theory this could depend on the action - does that mean action should be part of this?
      }>()
      .notNull(),
    // workspaceId: uuid('workspace_id'),
  },
  (table) => ({
    // workspaceIndex: index('workspace_index').on(table.workspaceId, table.id),
    // workspaceModelIndex: index('workspace_model_index').on(
    //   table.workspaceId,
    //   table.modelName,
    //   table.modelId
    // ),
    modelIndex: index('model_index').on(table.modelName, table.modelId),
  })
);
