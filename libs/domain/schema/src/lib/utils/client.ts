import { BaseMutationArgsSchemaMap, MutationArgsSchemaMap } from './base';
import { z } from 'zod';

export type ClientMutatorFn<Context, Args> = (
  context: Context,
  args: Args
) => void | Promise<void>;

export type ClientMutators<
  Context,
  MASM extends MutationArgsSchemaMap<Mutation, MutationArgsSchema>,
  Mutation extends keyof MASM & string = keyof MASM & string,
  MutationArgsSchema extends BaseMutationArgsSchemaMap<Mutation> = BaseMutationArgsSchemaMap<Mutation>
> = {
  [M in Mutation]: ClientMutatorFn<Context, z.infer<MASM[M]>>;
};
