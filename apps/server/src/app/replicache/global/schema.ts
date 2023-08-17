import { z } from 'zod';

export const cookieSchema = z.object({
  userId: z.string(),
});
