import { Replicache } from 'replicache';
import { environment } from './environment';
import {
  mutationArgsSchemaMap,
  ReplicacheMutatorDefs,
} from '@replivent/domain/schema';
import { v4 } from 'uuid';

const getUserId = () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    const newUserId = v4();
    localStorage.setItem('userId', newUserId);
    return newUserId;
  }

  return userId;
};

export const rep = new Replicache<
  ReplicacheMutatorDefs<typeof mutationArgsSchemaMap>
>({
  name: `${getUserId()}`,
  licenseKey: environment.VITE_REPLICACHE_LICENSE_KEY,
  pushURL: `${environment.VITE_API_URL}/replicache-push`,
  pullURL: `${environment.VITE_API_URL}/replicache-pull`,
  pullInterval: 10000,
  mutators: {
    createTrip: async (tx, { rocketTripId, ...args }) => {
      await tx.put(`RocketTrip/${rocketTripId}`, {
        ...args,
      });
    },
    updateTrip: async (tx, { rocketTripId, ...args }) => {
      // TODO: This is the same as, is that ok? Probably could be different on the server w/ extra validation?
      await tx.put(`RocketTrip/${rocketTripId}`, {
        ...args,
      });
    },
    deleteTrip: async (tx, { rocketTripId, ...args }) => {
      await tx.del(`RocketTrip/${rocketTripId}`);
    },
    reserveTrip: async (tx, { rocketTripPassengerId, ...args }) => {
      await tx.put(`RocketTripPassenger/${rocketTripPassengerId}`, {
        ...args,
      });
    },
    unreserveTrip: async (tx, { rocketTripPassengerId, ...args }) => {
      await tx.del(`RocketTripPassenger/${rocketTripPassengerId}`);
    },
  },
});

rep.getAuth = getUserId;
