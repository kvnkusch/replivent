import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { TrpcContext, trpcRouter } from '@replivent/trpc-server';
import {
  CreateFastifyContextOptions,
  fastifyTRPCPlugin,
} from '@trpc/server/adapters/fastify';
import { environment } from './environments/environment';
import cors from '@fastify/cors';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Replicache Global Strategy
import { handlePush } from './app/replicache/global/push';
import { handlePull } from './app/replicache/global/pull';

const server = fastify({
  maxParamLength: 5000,
  logger: true,
});

server.register(cors, {
  origin: (origin, cb) => {
    cb(null, true);
    return;
  },
  // TODO: Set allowed origin values
  // credentials: true,
});

// TODO: https://github.com/fastify/fastify-cookie#securing-the-cookie
server.register(cookie, {
  // secret: 'my-secret', // for cookies signature
  // parseOptions: {}, // options for parsing cookies
});

const createContext = async ({
  req,
  res,
}: CreateFastifyContextOptions): Promise<TrpcContext> => {
  const pool = new Pool({
    connectionString: environment.DATABASE_URL,
  });

  return {
    db: drizzle(pool),
  };
};

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: trpcRouter, createContext },
});

server.post('/replicache-pull', handlePull);

server.post('/replicache-push', handlePush);

(async () => {
  try {
    await server.listen({ port: environment.PORT, host: environment.HOST });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
