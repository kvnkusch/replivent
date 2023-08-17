import { Replicache } from 'replicache';
import { environment } from './environment';
import {
  mutationArgsSchemaMap,
  ReplicacheMutatorDefs,
} from '@replivent/domain/schema';

export const rep = new Replicache<
  ReplicacheMutatorDefs<typeof mutationArgsSchemaMap>
>({
  name: 'replivent',
  licenseKey: environment.VITE_REPLICACHE_LICENSE_KEY,
  pushURL: `${environment.VITE_API_URL}/replicache-push`,
  pullURL: `${environment.VITE_API_URL}/replicache-pull`,
  mutators: {
    createTrip: (tx, args) => {},
    reserveTrip: (tx, args) => {},
  },
});
