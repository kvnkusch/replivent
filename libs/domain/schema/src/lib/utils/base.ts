import { z } from 'zod';

// This is at another level of abstraction than most of this file
export type ZodMerge<
  U extends z.AnyZodObject,
  V extends z.AnyZodObject,
  UShape extends U['shape'] = U['shape'],
  VShape extends V['shape'] = V['shape']
> = z.ZodObject<z.objectUtil.extendShape<UShape, VShape>>;

export type BaseMutationArgsSchemaMap<M extends string> = Record<
  M,
  z.AnyZodObject
>;

export type MutationArgsSchemaMap<
  Mutation extends string,
  MutationArgsSchema extends BaseMutationArgsSchemaMap<Mutation>
> = {
  [M in Mutation]: MutationArgsSchema[M];
};

export type BaseMutation = {
  name: string;
  args: any;
};
