import type { User } from "./user";

/** Credentials accepted by `POST /api/login`. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Payload accepted by `POST /api/register`. */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
}

/** Response from `/api/login` and `/api/register`. */
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;
