import type { User } from './user';

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

/** Response from `/api/auth/whatsapp/request-code`. Same body regardless of
 *  whether the phone is registered (anti-enumeration). */
export interface WhatsappRequestCodeResponse {
	message: string;
	expires_in_seconds: number;
	cooldown_seconds: number;
}

/** Successful response from `/api/auth/whatsapp/verify-code`. */
export type WhatsappVerifyCodeResponse = AuthResponse;
