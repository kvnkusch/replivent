import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export type PgTransaction = Parameters<
  Parameters<NodePgDatabase['transaction']>[0]
>[0];
