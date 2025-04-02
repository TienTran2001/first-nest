import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, { message: 'Price must be a positive number' }),
  imageUrl: z.string().optional(),
  quantity: z.number().min(0, {
    message: 'Quantity must be a positive number',
  }),
  isActive: z.boolean().optional(),
  category: z.string().optional(),
});

export type TypeCreateProductSchema = z.infer<typeof createProductSchema>;
