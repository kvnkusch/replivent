import { PgTransaction } from '../../types';
import {
  createMutate,
  replicacheMutationBase,
  mutationArgsSchemaMap,
  ServerMutators,
} from '@replivent/domain/schema';

type Context = { tx: PgTransaction };
type Result = void;
type AddtlArgs = { nextVersion: number };

export const mutators: ServerMutators<
  Context,
  Result,
  AddtlArgs,
  typeof mutationArgsSchemaMap
> = {
  createTrip: async ({ tx }, args) => {},
  reserveTrip: async ({ tx }, args) => {},
};

export const mutate = createMutate(
  mutationArgsSchemaMap,
  replicacheMutationBase,
  mutators
);
