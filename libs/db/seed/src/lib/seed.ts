import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { seedGlobalReplicacheData } from './global';
import { seedSyncActionReplicacheData } from './syncAction';

export const seedDatabase = async (db: NodePgDatabase) => {
  await seedGlobalReplicacheData(db);
  await seedSyncActionReplicacheData(db);
};
