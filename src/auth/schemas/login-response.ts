import { z } from 'zod';

export const loginResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
});
