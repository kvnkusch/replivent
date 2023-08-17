import { z } from 'zod';
import {
  BaseMutation,
  BaseMutationArgsSchemaMap,
  MutationArgsSchemaMap,
} from './base';

// TODO: Do I need the whole mutation here, not just args?
export type ServerMutatorFn<Context, Result, Args, AddtlArgs> = (
  context: Context,
  args: Args,
  addtlArgs: AddtlArgs
) => Promise<Result>;

export type ServerMutators<
  Context,
  Result,
  AddtlArgs,
  MASM extends MutationArgsSchemaMap<Mutation, MutationArgsSchema>,
  Mutation extends keyof MASM & string = keyof MASM & string,
  MutationArgsSchema extends BaseMutationArgsSchemaMap<Mutation> = BaseMutationArgsSchemaMap<Mutation>
> = {
  [M in Mutation]: ServerMutatorFn<Context, Result, MASM[M], AddtlArgs>;
};

type ProcessMutation<
  Context,
  Result,
  AddtlArgs,
  MASM extends MutationArgsSchemaMap<Mutation, MutationArgsSchema>,
  Mutation extends keyof MASM & string = keyof MASM & string,
  MutationArgsSchema extends BaseMutationArgsSchemaMap<Mutation> = BaseMutationArgsSchemaMap<Mutation>
> = (
  mutation: BaseMutation,
  context: Context,
  addtlArgs: AddtlArgs
) => Promise<Result>;

export function createMutate<
  Context,
  Result,
  AddtlArgs,
  BaseMutationSchema extends z.AnyZodObject,
  MASM extends MutationArgsSchemaMap<Mutation, MutationArgsSchema>,
  Mutation extends keyof MASM & string = keyof MASM & string,
  MutationArgsSchema extends BaseMutationArgsSchemaMap<Mutation> = BaseMutationArgsSchemaMap<Mutation>
>(
  mutationArgsSchemaMap: MASM,
  baseMutationSchema: BaseMutationSchema,
  mutators: ServerMutators<Context, Result, AddtlArgs, MASM>
): ProcessMutation<Context, Result, AddtlArgs, MASM> {
  const allCompleteSchema = [] as unknown as [
    z.ZodTypeAny,
    z.ZodTypeAny,
    ...z.ZodTypeAny[]
  ];
  for (const key in mutationArgsSchemaMap) {
    const argsSchema = mutationArgsSchemaMap[key];
    allCompleteSchema.push(
      baseMutationSchema.merge(
        z.object({
          name: z.literal(key),
          args: argsSchema,
        })
      )
    );
  }

  const mutationsUnionSchema = z.union(allCompleteSchema);

  function processMutation(
    mutation: BaseMutation,
    context: Context,
    addtlArgs: AddtlArgs
  ): Promise<Result> {
    // TODO: safeParse + better error?
    const validatedMutation = mutationsUnionSchema.parse(mutation);
    const fn = mutators[validatedMutation.name as Mutation];
    return fn(context, validatedMutation.args, addtlArgs);
  }

  return processMutation;
}

// type MutationSchema<
//   MASM extends MutationArgsSchemaMap<Mutation, MutationArgsSchema>,
//   Mutation extends string = string,
//   MutationArgsSchema extends BaseMutationArgsSchemaMap<Mutation> = BaseMutationArgsSchemaMap<Mutation>
// > = z.ZodObject<{
//   clientID: z.ZodString;
//   id: z.ZodNumber;
//   name: z.ZodLiteral<M>;
//   args: z.ZodObject<A>;
// }>;

// type MutationsSchema<
//   MASM extends MutationArgsSchemaMap<Mutation, MutationArgsSchema>,
//   Mutation extends string = string,
//   MutationArgsSchema extends BaseMutationArgsSchemaMap<Mutation> = BaseMutationArgsSchemaMap<Mutation>
// > = {
//   [M in Mutation]: z.ZodObject<{
//     clientID: z.ZodString;
//     id: z.ZodNumber;
//     name: z.ZodLiteral<M>;
//     args: z.ZodObject<MutationArgsSchema[M]>;
//   }>;
// };

// // TODO: Generic over context type, return type
// type MutationFns<
//   MS extends MutationsSchema<M, MA>,
//   M extends keyof MS & string,
//   MA extends Record<M, ZodRawShape>
// > = {
//   [K in M]: (mutation: z.infer<MS[K]>, context: any) => Promise<void>;
// };

// type MutationsFn<
//   MS extends MutationsSchema<M, MA>,
//   M extends keyof MS & string,
//   MA extends Record<M, ZodRawShape>
// > = (mutation: MutationSchema<string, any>) => Promise<void>;
