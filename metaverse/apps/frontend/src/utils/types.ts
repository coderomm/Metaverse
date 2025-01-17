// src/types/auth.ts
import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["User", "Admin"]),
});

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export interface User {
  email: string,
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

export interface GetElementsResponse {
  elements: Element[];
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

export interface CreateAvatarData {
  name: string;
  imageUrl: string;
}

export interface Avatar {
  id: string;
  imageUrl: string;
  name: string;
}

export interface GetAvatarsResponse {
  avatars: Avatar[];
}

export interface MapElement {
  elementId: string;
  x: number;
  y: number;
}

export interface MapCreateFormData {
  name: string;
  dimensions: string;
  thumbnail: string;
  defaultElements: MapElement[];
}

export type SignupInput = z.infer<typeof SignupSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;

export interface Position {
  x: number;
  y: number;
}

export interface UserRes {
  id: string;
  x: number;
  y: number;
  color?: string;
}

export interface SpaceData {
  creatorId: string;
  height: number;
  id: string;
  mapId?: string;
  name: string;
  thumbnail?: string;
  width: number;
}