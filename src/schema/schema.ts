import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  search: z.string().optional(),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
