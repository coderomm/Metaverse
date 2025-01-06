// src/types/auth.ts
import { z } from 'zod';

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string(),
  type: z.enum(["user", "admin"]),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;