// src/types/auth.ts
import { z } from 'zod';

export const SignupSchema = z.object({
  username: z.string().email(),
  password: z.string(),
  role: z.enum(["User", "Admin"]),
});

export const SigninSchema = z.object({
  username: z.string().email(),
  password: z.string(),
});

export interface User {
  username: string,
  role: 'User' | 'Admin';
  avatarId?: string,
  imageUrl?: string
}

export interface SignInResponse {
  token: string,
  user: User
}

export interface Element {
  id: string;
  width: number;
  height: number;
  static: boolean;
  imageUrl: string;
}

export interface CreateElementData {
  width: number;
  height: number;
  static: boolean;
  imageUrl: string;
}

export interface UpdateElementData {
  imageUrl: string;
}

export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
