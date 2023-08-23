import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  globalReplicacheSpace,
  location,
  launchPad,
  locationComplianceRule,
  rocketModel,
  rocket,
  person,
} from '@replivent/db/schema';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { formatISO } from 'date-fns';

export const seedGlobalReplicacheData = async (db: NodePgDatabase) => {
  await db.transaction(async (tx) => {
    await tx.insert(globalReplicacheSpace).values({
      version: 1,
    });

    const [capeCanaveral, houston, theMoon, mars] = await tx
      .insert(location)
      .values([
        {
          ...commonSeedData(),
          name: 'Cape Canaveral',
        },
        {
          ...commonSeedData(),
          name: 'Houston',
        },
        {
          ...commonSeedData(),
          name: 'The Moon',
        },
        {
          ...commonSeedData(),
          name: 'Mars',
        },
      ])
      .returning();

    await tx
      .insert(launchPad)
      .values([
        {
          ...commonSeedData(),
          name: 'Cape 1',
          locationId: capeCanaveral!.id,
        },
        {
          ...commonSeedData(),
          name: 'Cape 2',
          locationId: capeCanaveral!.id,
        },
        {
          ...commonSeedData(),
          name: 'Houston 1',
          locationId: houston!.id,
        },
        {
          ...commonSeedData(),
          name: 'Houston 2',
          locationId: houston!.id,
        },
        {
          ...commonSeedData(),
          name: 'Houston 3',
          locationId: houston!.id,
        },
        {
          ...commonSeedData(),
          name: 'Lunar Launch Pad',
          locationId: theMoon!.id,
        },
        {
          ...commonSeedData(),
          name: 'Martian-1',
          locationId: mars!.id,
        },
      ])
      .returning();

    await tx.insert(locationComplianceRule).values([
      // Cape Canaveral
      {
        ...commonSeedData(),
        locationId: capeCanaveral!.id,
        attribute: 'percent_at_risk_passengers',
        op: 'le',
        value: '0.2',
      },
      {
        ...commonSeedData(),
        locationId: capeCanaveral!.id,
        attribute: 'percent_unhealthy_passengers',
        op: 'le',
        value: '0.1',
      },
      // The Moon
      {
        ...commonSeedData(),
        locationId: theMoon!.id,
        attribute: 'rocket_trip_start_minus_passenger_health_check_in_days',
        op: 'ge',
        value: '0',
      },
      {
        ...commonSeedData(),
        locationId: theMoon!.id,
        attribute: 'rocket_trip_start_minus_passenger_health_check_in_days',
        op: 'le',
        value: '3',
      },
      {
        ...commonSeedData(),
        locationId: theMoon!.id,
        attribute: 'percent_healthy_passengers',
        op: 'eq',
        value: '1',
      },
      // Mars
      {
        ...commonSeedData(),
        locationId: mars!.id,
        attribute: 'rocket_trip_start_minus_passenger_health_check_in_days',
        op: 'ge',
        value: '0',
      },
      {
        ...commonSeedData(),
        locationId: mars!.id,
        attribute: 'rocket_trip_start_minus_passenger_health_check_in_days',
        op: 'le',
        value: '7',
      },
      {
        ...commonSeedData(),
        locationId: mars!.id,
        attribute: 'percent_healthy_passengers',
        op: 'ge',
        value: '0.9',
      },
      {
        ...commonSeedData(),
        locationId: mars!.id,
        attribute: 'percent_unhealthy_passengers',
        op: 'eq',
        value: '0',
      },
    ]);

    const [starship, xWing, flyingSaucer] = await tx
      .insert(rocketModel)
      .values([
        {
          ...commonSeedData(),
          name: 'Starship',
          maxPassengerCapacity: 4,
          weightLimitLbs: 1000,
        },
        {
          ...commonSeedData(),
          name: 'X-Wing',
          maxPassengerCapacity: 1,
          weightLimitLbs: 200,
        },
        {
          ...commonSeedData(),
          name: 'Flying Saucer',
          maxPassengerCapacity: 1_000,
          weightLimitLbs: 1_000_000,
        },
      ])
      .returning();

    await tx.insert(rocket).values([
      {
        ...commonSeedData(),
        modelId: flyingSaucer!.id,
        serialNumber: 'X&U*(#H(F',
      },
      {
        ...commonSeedData(),
        modelId: flyingSaucer!.id,
        serialNumber: 'Z_E(J>>VIA',
      },
      ...Array.from({ length: 100 }).map((_, i) => ({
        ...commonSeedData(),
        modelId: starship!.id,
        serialNumber: (i + 1).toString(),
      })),
      ...['Red', 'Gold', 'Blue'].flatMap((squadron) =>
        ['Leader', 'One', 'Three', 'Five'].map((callsign) => ({
          ...commonSeedData(),
          modelId: xWing!.id,
          serialNumber: `${squadron} ${callsign}`,
        }))
      ),
    ]);

    await tx.insert(person).values(
      Array.from({ length: 1000 }).map((_, i) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        return {
          ...commonSeedData(),
          firstName,
          lastName,
          birthDate: formatISO(
            faker.date.birthdate({
              min: 14,
              max: 80,
            }),
            { representation: 'date' }
          ),
          phoneNumber: faker.helpers.maybe(
            () => faker.phone.number('+1XXXXXXXXXX'),
            {
              probability: 0.4,
            }
          ),
          email: faker.helpers.maybe(
            () =>
              faker.internet.email({
                firstName,
                lastName,
              }),
            {
              probability: 0.8,
            }
          ),
        };
      })
    );
  });
};

function commonSeedData() {
  return {
    id: v4(),
    lastModifiedVersion: 1,
  };
}
