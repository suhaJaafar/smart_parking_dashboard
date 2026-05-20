import 'server-only';

import { cookies } from 'next/headers';

import { authConfig } from '@/app/config/auth';

/**
 * Session cookie helpers. The cookie stores the Laravel-issued JWT verbatim
 * — we never re-sign it on the Next.js side.
 *
 * Next.js 16: `cookies()` is async.
 */

export async function getSessionToken(): Promise<string | null> {
	const store = await cookies();
	return store.get(authConfig.cookie.name)?.value ?? null;
}

export async function setSessionToken(token: string): Promise<void> {
	const store = await cookies();
	const { name, ...opts } = authConfig.cookie;
	store.set(name, token, opts);
}

export async function clearSessionToken(): Promise<void> {
	try {
		const store = await cookies();
		store.delete(authConfig.cookie.name);
	} catch (cause) {
		if (process.env.NODE_ENV !== 'production') {
			const message = cause instanceof Error ? cause.message : String(cause);
			console.warn(`[auth] clearSessionToken skipped: ${message}`);
		}
	}
}
