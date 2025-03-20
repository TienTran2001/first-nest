import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Email is not valid' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().min(1, { message: 'Name is required' }),
  otp: z
    .string()
    .min(4, { message: 'OTP must be at least 4 characters' })
    .max(6, { message: 'OTP must be at most 6 characters' }),
});

export type TypeRegisterSchema = z.infer<typeof registerSchema>;

export const requestOtpSchema = z.object({
  email: z.string().email({ message: 'Email is not valid' }),
});

export type TypeRequestOtpSchema = z.infer<typeof requestOtpSchema>;
