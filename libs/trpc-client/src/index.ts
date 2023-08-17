import { createTRPCReact } from '@trpc/react-query';
import type { TrpcRouter } from '@replivent/trpc-server';

export const trpc = createTRPCReact<TrpcRouter>();
