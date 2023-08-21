import { FastifyRequest } from 'fastify';
import { z } from 'zod';

export function getAuth(req: FastifyRequest) {
  return z.string().uuid().safeParse(req.headers.authorization);
}
