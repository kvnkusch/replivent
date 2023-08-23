import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { syncAction } from '@replivent/db/schema';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { formatISO } from 'date-fns';

export const seedSyncActionReplicacheData = async (db: NodePgDatabase) => {
  await db.transaction(async (tx) => {
    const capeCanaveralId = v4();
    const houstonId = v4();
    const theMoonId = v4();
    const marsId = v4();

    await tx.insert(syncAction).values([
      {
        modelName: 'Location',
        modelId: capeCanaveralId,
        type: 'insert',
        data: { name: 'Cape Canaveral' },
      },
      {
        modelName: 'Location',
        modelId: houstonId,
        type: 'insert',
        data: { name: 'Houston' },
      },
      {
        modelName: 'Location',
        modelId: theMoonId,
        type: 'insert',
        data: { name: 'The Moon' },
      },
      {
        modelName: 'Location',
        modelId: marsId,
        type: 'insert',
        data: { name: 'Mars' },
      },
    ]);

    await tx.insert(syncAction).values([
      {
        modelName: 'LaunchPad',
        modelId: v4(),
        type: 'insert',
        data: {
          name: 'Cape 1',
          locationId: capeCanaveralId,
        },
      },
      {
        modelName: 'LaunchPad',
        modelId: v4(),
        type: 'insert',
        data: {
          name: 'Cape 2',
          locationId: capeCanaveralId,
        },
      },
      {
        modelName: 'LaunchPad',
        modelId: v4(),
        type: 'insert',
        data: {
          name: 'Houston 1',
          locationId: houstonId,
        },
      },
      {
        modelName: 'LaunchPad',
        modelId: v4(),
        type: 'insert',
        data: {
          name: 'Houston 2',
          locationId: houstonId,
        },
      },
      {
        modelName: 'LaunchPad',
        modelId: v4(),
        type: 'insert',
        data: {
          name: 'Houston 3',
          locationId: houstonId,
        },
      },
      {
        modelName: 'LaunchPad',
        modelId: v4(),
        type: 'insert',
        data: {
          name: 'Lunar Launch Pad',
          locationId: theMoonId,
        },
      },
      {
        modelName: 'LaunchPad',
        modelId: v4(),
        type: 'insert',
        data: {
          name: 'Martian-1',
          locationId: marsId,
        },
      },
    ]);

    await tx.insert(syncAction).values([
      // Cape Canaveral
      {
        modelName: 'LocationComplianceRule',
        modelId: v4(),
        type: 'insert',
        data: {
          locationId: capeCanaveralId,
          attribute: 'percent_at_risk_passengers',
          op: 'le',
          value: '0.2',
        },
      },
      {
        modelName: 'LocationComplianceRule',
        modelId: v4(),
        type: 'insert',
        data: {
          locationId: capeCanaveralId,
          attribute: 'percent_unhealthy_passengers',
          op: 'le',
          value: '0.1',
        },
      },
      // The Moon
      {
        modelName: 'LocationComplianceRule',
        modelId: v4(),
        type: 'insert',
        data: {
          locationId: theMoonId,
          attribute: 'rocket_trip_start_minus_passenger_health_check_in_days',
          op: 'ge',
          value: '0',
        },
      },
      {
        modelName: 'LocationComplianceRule',
        modelId: v4(),
        type: 'insert',
        data: {
          locationId: theMoonId,
          attribute: 'rocket_trip_start_minus_passenger_health_check_in_days',
          op: 'le',
          value: '3',
        },
      },
      {
        modelName: 'LocationComplianceRule',
        modelId: v4(),
        type: 'insert',
        data: {
          locationId: theMoonId,
          attribute: 'percent_healthy_passengers',
          op: 'eq',
          value: '1',
        },
      },
      // Mars
      {
        modelName: 'LocationComplianceRule',
        modelId: v4(),
        type: 'insert',
        data: {
          locationId: marsId,
          attribute: 'rocket_trip_start_minus_passenger_health_check_in_days',
          op: 'ge',
          value: '0',
        },
      },
      {
        modelName: 'LocationComplianceRule',
        modelId: v4(),
        type: 'insert',
        data: {
          locationId: marsId,
          attribute: 'rocket_trip_start_minus_passenger_health_check_in_days',
          op: 'le',
          value: '7',
        },
      },
      {
        modelName: 'LocationComplianceRule',
        modelId: v4(),
        type: 'insert',
        data: {
          locationId: marsId,
          attribute: 'percent_healthy_passengers',
          op: 'ge',
          value: '0.9',
        },
      },
      {
        modelName: 'LocationComplianceRule',
        modelId: v4(),
        type: 'insert',
        data: {
          locationId: marsId,
          attribute: 'percent_unhealthy_passengers',
          op: 'eq',
          value: '0',
        },
      },
    ]);

    const starshipId = v4();
    const xWingId = v4();
    const flyingSaucerId = v4();
    await tx.insert(syncAction).values([
      {
        modelName: 'RocketModel',
        modelId: starshipId,
        type: 'insert',
        data: {
          name: 'Starship',
          maxPassengerCapacity: 4,
          weightLimitLbs: 1000,
        },
      },
      {
        modelName: 'RocketModel',
        modelId: xWingId,
        type: 'insert',
        data: {
          name: 'X-Wing',
          maxPassengerCapacity: 1,
          weightLimitLbs: 200,
        },
      },
      {
        modelName: 'RocketModel',
        modelId: flyingSaucerId,
        type: 'insert',
        data: {
          name: 'Flying Saucer',
          maxPassengerCapacity: 1_000,
          weightLimitLbs: 1_000_000,
        },
      },
    ]);

    await tx.insert(syncAction).values([
      {
        modelName: 'Rocket',
        modelId: v4(),
        type: 'insert',
        data: {
          modelId: flyingSaucerId,
          serialNumber: 'X&U*(#H(F',
        },
      },
      {
        modelName: 'Rocket',
        modelId: v4(),
        type: 'insert',
        data: {
          modelId: flyingSaucerId,
          serialNumber: 'Z_E(J>>VIA',
        },
      },
      ...Array.from({ length: 100 }).map((_, i) => ({
        modelName: 'Rocket',
        modelId: v4(),
        type: 'insert' as const,
        data: {
          modelId: starshipId,
          serialNumber: (i + 1).toString(),
        },
      })),
      ...['Red', 'Gold', 'Blue'].flatMap((squadron) =>
        ['Leader', 'One', 'Three', 'Five'].map((callsign) => ({
          modelName: 'Rocket',
          modelId: v4(),
          type: 'insert' as const,
          data: {
            modelId: xWingId,
            serialNumber: `${squadron} ${callsign}`,
          },
        }))
      ),
    ]);

    await tx.insert(syncAction).values(
      Array.from({ length: 1000 }).map((_, i) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        return {
          modelName: 'Person',
          modelId: v4(),
          type: 'insert' as const,
          data: {
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
          },
        };
      })
    );
  });
};
