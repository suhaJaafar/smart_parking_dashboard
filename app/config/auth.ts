import { env } from './env';

/**
 * Auth / session configuration. Centralised so all auth-related code reads
 * cookie naming, lifetimes, and route conventions from a single place.
 */
export const authConfig = {
	cookie: {
		name: env.SESSION_COOKIE_NAME,
		maxAge: env.SESSION_MAX_AGE,
		httpOnly: true,
		secure: env.SESSION_COOKIE_SECURE,
		sameSite: 'lax',
		path: '/',
	},
	routes: {
		/** Where to send unauthenticated users. */
		login: '/auth/login',
		/** Where to send authenticated users (default landing). */
		home: '/dashboard',
		/** Where to send authenticated-but-forbidden users by default. */
		forbidden: '/dashboard',
	},
} as const;

export type AuthConfig = typeof authConfig;
