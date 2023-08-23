import { z } from 'zod';
import { useSubscribe } from 'replicache-react';
import { rep } from '../../replicache';
import {
  launchPadSchema,
  locationSchema,
  rocketModelSchema,
  rocketSchema,
  rocketTripSchema,
} from '@replivent/domain/schema';
import { addDays } from 'date-fns';
import { v4 } from 'uuid';

export function HomePage() {
  const rocketTripIds = useSubscribe(
    rep,
    async (tx) => {
      const raw = await tx
        .scan({
          prefix: 'RocketTrip/',
        })
        .keys()
        .toArray();

      return raw.map((key) => z.string().parse(key.split('/')[1]));
    },
    []
  );

  const rocketIds = useSubscribe(
    rep,
    async (tx) => {
      const raw = await tx
        .scan({
          prefix: 'Rocket/',
        })
        .keys()
        .toArray();

      return raw.map((key) => z.string().parse(key.split('/')[1]));
    },
    []
  );

  const launchPadIds = useSubscribe(
    rep,
    async (tx) => {
      const raw = await tx
        .scan({
          prefix: 'LaunchPad/',
        })
        .keys()
        .toArray();

      return raw.map((key) => z.string().parse(key.split('/')[1]));
    },
    []
  );

  const handleCreateTrip = () => {
    const rocketId = rocketIds[Math.floor(Math.random() * rocketIds.length)];
    const startLaunchPadId =
      launchPadIds[Math.floor(Math.random() * launchPadIds.length)];
    const endLaunchPadId =
      launchPadIds[Math.floor(Math.random() * launchPadIds.length)];

    if (!rocketId || !startLaunchPadId || !endLaunchPadId) {
      return;
    }

    const startDate = new Date();
    const endDate = addDays(startDate, Math.floor(Math.random() * 6) + 1);

    rep.mutate.createTrip({
      rocketTripId: v4(),
      rocketId,
      startLaunchPadId,
      endLaunchPadId,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      passengerCapacity: null,
    });
  };

  return (
    <div className="container mx-auto h-full overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-3xl">
          Rocket Trips (RT: {rocketTripIds.length}, R: {rocketIds.length})
        </p>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white"
          onClick={handleCreateTrip}
        >
          Create Trip
        </button>
      </div>

      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Rocket Description</th>
            <th className="border px-4 py-2">Start Location</th>
            <th className="border px-4 py-2">End Location</th>
            <th className="border px-4 py-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {rocketTripIds?.map((rocketTripId) => (
            <RocketTripTableRow
              key={rocketTripId}
              rocketTripId={rocketTripId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

const RocketTripTableRow = ({ rocketTripId }: { rocketTripId: string }) => {
  const data = useSubscribe(
    rep,
    async (tx) => {
      const rocketTripResult = await tx.get(`RocketTrip/${rocketTripId}`);
      if (!rocketTripResult) {
        return null;
      }
      const rocketTrip = rocketTripSchema.parse(rocketTripResult);

      const [rocketResult, startLaunchPadResult, endLaunchPadResult] =
        await Promise.all([
          tx.get(`Rocket/${rocketTrip.rocketId}`),
          tx.get(`LaunchPad/${rocketTrip.startLaunchPadId}`),
          tx.get(`LaunchPad/${rocketTrip.endLaunchPadId}`),
        ]);
      if (!rocketResult || !startLaunchPadResult || !endLaunchPadResult) {
        return null;
      }
      const rocket = rocketSchema.parse(rocketResult);
      const startLaunchPad = launchPadSchema.parse(startLaunchPadResult);
      const endLaunchPad = launchPadSchema.parse(endLaunchPadResult);

      const [rocketModelResult, startLocationResult, endLocationResult] =
        await Promise.all([
          tx.get(`RocketModel/${rocket.modelId}`),
          tx.get(`Location/${startLaunchPad.locationId}`),
          tx.get(`Location/${endLaunchPad.locationId}`),
        ]);
      if (!rocketModelResult || !startLocationResult || !endLocationResult) {
        return null;
      }

      const rocketModel = rocketModelSchema.parse(rocketModelResult);
      const startLocation = locationSchema.parse(startLocationResult);
      const endLocation = locationSchema.parse(endLocationResult);

      return {
        rocketTrip,
        rocket,
        rocketModel,
        startLaunchPad,
        endLaunchPad,
        startLocation,
        endLocation,
      };
    },
    null
  );

  if (!data) {
    return <tr></tr>;
  }

  const handleUpdateTrip = () => {
    const startDate = new Date();
    const endDate = addDays(startDate, Math.floor(Math.random() * 6) + 1);

    rep.mutate.updateTrip({
      rocketTripId,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      passengerCapacity: null,
    });
  };

  return (
    <tr onClick={() => handleUpdateTrip()}>
      <td className="border px-4 py-2">
        {data.rocketModel.name} ({data.rocket.serialNumber})
      </td>
      <td className="border px-4 py-2">
        {data.startLaunchPad.name} ({data.startLocation.name})
      </td>
      <td className="border px-4 py-2">
        {data.endLaunchPad.name} ({data.endLocation.name})
      </td>
      <td className="border px-4 py-2">
        {new Date(data.rocketTrip.start).toLocaleDateString()} -{' '}
        {new Date(data.rocketTrip.end).toLocaleDateString()}
      </td>
    </tr>
  );
};

const LaunchPadList = ({ className }: { className?: string }) => {
  const locations = useSubscribe(
    rep,
    async (tx) => {
      const raw = await tx
        .scan({
          prefix: 'Location/',
        })
        .entries()
        .toArray();

      // Could be a reusable fn. Could also just store id in the payload?
      // What's the downside of that?
      return raw.map(([key, r]) => ({
        id: z.string().parse(key.split('/')[1]),
        ...locationSchema.parse(r),
      }));
    },
    null
  );

  const launchPads = useSubscribe(
    rep,
    async (tx) => {
      const raw = await tx
        .scan({
          prefix: 'LaunchPad/',
        })
        .entries()
        .toArray();

      // Could be a reusable fn. Could also just store id in the payload?
      // What's the downside of that?
      return raw.map(([key, r]) => ({
        id: z.string().parse(key.split('/')[1]),
        ...launchPadSchema.parse(r),
      }));
    },
    null
  );

  return (
    <div className={className}>
      <span className="pb-2 text-3xl">Locations</span>
      {locations?.map((l) => (
        <div key={l.id} className="my-2">
          <span className="pb-1 text-xl">{l.name}</span>
          {launchPads
            ?.filter((lp) => lp.locationId === l.id)
            .map((lp) => (
              <div key={lp.id}>
                <span>{lp.name}</span>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};
