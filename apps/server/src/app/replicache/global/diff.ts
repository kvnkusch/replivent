import { PgTransaction } from '../../types';
import {
  location,
  launchPad,
  locationComplianceRule,
  rocket,
  rocketModel,
  rocketTrip,
  rocketTripComplianceRule,
  rocketTripPassenger,
  person,
  personHealthCheck,
} from '@replivent/db/schema';
import type { PatchOperation } from 'replicache';
import { gt } from 'drizzle-orm';
import { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';

const tablesAndMetadata: { table: BaseTable; modelName: string }[] = [
  { table: location, modelName: 'Location' },
  { table: launchPad, modelName: 'LaunchPad' },
  { table: locationComplianceRule, modelName: 'LocationComplianceRule' },
  { table: rocket, modelName: 'Rocket' },
  { table: rocketModel, modelName: 'RocketModel' },
  { table: rocketTrip, modelName: 'RocketTrip' },
  { table: rocketTripComplianceRule, modelName: 'RocketTripComplianceRule' },
  { table: rocketTripPassenger, modelName: 'RocketTripPassenger' },
  { table: person, modelName: 'Person' },
  { table: personHealthCheck, modelName: 'PersonHealthCheck' },
];

type BaseTable = PgTableWithColumns<{
  name: string;
  schema: undefined;
  // TODO: This could probably be derived by slightly more clever typescript
  columns: {
    id: PgColumn<
      {
        name: 'id';
        tableName: string;
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        enumValues: undefined;
        baseColumn: never;
      },
      {},
      {}
    >;
    deleted: PgColumn<
      {
        name: 'deleted';
        tableName: string;
        dataType: 'boolean';
        columnType: 'PgBoolean';
        data: boolean;
        driverParam: boolean;
        notNull: false;
        hasDefault: true;
        enumValues: undefined;
        baseColumn: never;
      },
      {},
      {}
    >;
    lastModifiedVersion: PgColumn<
      {
        name: 'last_modified_version';
        tableName: string;
        dataType: 'number';
        columnType: 'PgInteger';
        data: number;
        driverParam: string | number;
        notNull: true;
        hasDefault: false;
        enumValues: undefined;
        baseColumn: never;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;

async function getChanged(
  tx: PgTransaction,
  sinceVersion: number,
  table: BaseTable,
  modelName: string
): Promise<PatchOperation[]> {
  const results = await tx
    .select()
    .from(table)
    .where(gt(table.lastModifiedVersion, sinceVersion));

  return results.map(({ id, deleted, lastModifiedVersion, ...value }) => {
    const key = `${modelName}/${id}`;
    if (deleted) {
      return {
        op: 'del',
        key,
      };
    } else {
      return {
        op: 'put',
        key,
        value,
      };
    }
  });
}

export async function getAllChanges(
  tx: PgTransaction,
  sinceVersion: number
): Promise<PatchOperation[]> {
  const allResults = await Promise.all(
    tablesAndMetadata.map(({ table, modelName }) =>
      getChanged(tx, sinceVersion, table, modelName)
    )
  );
  return allResults.flat();
}
