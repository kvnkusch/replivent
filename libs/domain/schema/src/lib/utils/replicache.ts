import { z } from 'zod';
import { ClientMutators } from './client';
import type { WriteTransaction } from 'replicache';
import { BaseMutationArgsSchemaMap, MutationArgsSchemaMap } from './base';

export const replicacheMutationBase = z.object({
  clientID: z.string(),
  id: z.number(),
});

export type ReplicacheMutatorDefs<
  MASM extends MutationArgsSchemaMap<Mutation, MutationArgsSchema>,
  Mutation extends keyof MASM & string = keyof MASM & string,
  MutationArgsSchema extends BaseMutationArgsSchemaMap<Mutation> = BaseMutationArgsSchemaMap<Mutation>
> = ClientMutators<WriteTransaction, MASM>;
