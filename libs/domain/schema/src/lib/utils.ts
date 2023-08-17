import { ZodRawShape, z } from 'zod';

// // Feels like I'm re-creating tRPC here.. is there any way to leverage it even though it isn't the main entry point?

// This is at another level of abstraction than more of this file
export type ZodMerge<
  U extends z.AnyZodObject,
  V extends z.AnyZodObject,
  UShape extends U['shape'] = U['shape'],
  VShape extends V['shape'] = V['shape']
> = z.ZodObject<z.objectUtil.extendShape<UShape, VShape>>;

type BaseMutationArgsSchema<M extends string> = Record<M, z.AnyZodObject>; // or maybe z.AnyZodObject?

export type MutationArgsSchemas<
  Mutation extends string,
  MutationArgsSchema extends BaseMutationArgsSchema<Mutation>
> = {
  [M in Mutation]: MutationArgsSchema[M];
};

type MutationsSchema<M extends string, MA extends Record<M, ZodRawShape>> = {
  [K in M]: MutationSchema<K, MA[K]>;
};

type MutationSchema<M extends string, A extends ZodRawShape> = z.ZodObject<{
  clientID: z.ZodString;
  id: z.ZodNumber;
  name: z.ZodLiteral<M>;
  args: z.ZodObject<A>;
}>;

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

function createMutationsSchema<
  MS extends MutationsSchema<M, MA>,
  M extends keyof MS & string,
  MA extends Record<M, ZodRawShape>
>(m: MS): MS {
  return m;
}

// export function createMutationSchemaArgs<
//   MS extends MutationSchemaArgs<M, MA>,
//   M extends keyof MS & string,
//   MA extends Record<M, z.ZodObject<z.ZodRawShape>>
// >(m: MS): MS {
//   return m;
// }

// // TODO: Should accept a "createContext" function here. Really starting to feel like a weird layer of abstraction though
// export const createMutationsFn = <
//   MS extends MutationsSchema<M, MA>,
//   M extends keyof MS & string = keyof MS & string,
//   MA extends Record<M, ZodRawShape> = Record<M, ZodRawShape>
// >(
//   mutationsSchema: MS,
//   mutationFns: MutationFns<MS, M, MA>
// ): MutationsFn<MS, M, MA> => {
//   const mutationsUnionSchema = z.union(
//     Object.values(mutationsSchema) as [
//       MutationSchema<M, MA[M]>,
//       MutationSchema<M, MA[M]>,
//       ...MutationSchema<M, MA[M]>[]
//     ]
//   );
//   return async (mutation: MutationSchema<string, any>) => {
//     const result = mutationsUnionSchema.safeParse(mutation);
//     if (result.success) {
//       return mutationFns[result.data.name](result.data, undefined);
//     } else {
//       throw result.error;
//     }
//   };
// };
