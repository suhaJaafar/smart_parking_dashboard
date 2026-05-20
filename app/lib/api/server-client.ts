import 'server-only';

import { siteConfig } from '@/app/config/site';
import { getSessionToken } from '@/app/lib/auth/session';
import type { ApiErrorBody, ApiResult, HttpMethod } from '@/app/types/api';

export interface ApiFetchOptions extends Omit<RequestInit, 'body' | 'method'> {
	method?: HttpMethod;
	/** JSON body — auto-stringified, sets `Content-Type: application/json`. */
	json?: unknown;
	/** Override the auth token. `null` disables auth; `undefined` reads cookie. */
	token?: string | null;
	/** When true, throws `ApiRequestError` on non-2xx. */
	throwOnError?: boolean;
}

/** Typed error for code paths that prefer try/catch over result-style handling. */
export class ApiRequestError extends Error {
	readonly status: number;
	readonly body: ApiErrorBody | null;

	constructor(status: number, body: ApiErrorBody | null) {
		super(body?.message ?? body?.error ?? `Request failed with ${status}`);
		this.name = 'ApiRequestError';
		this.status = status;
		this.body = body;
	}
}

function buildUrl(path: string): string {
	const suffix = path.startsWith('/') ? path : `/${path}`;
	return `${siteConfig.apiUrl}${suffix}`;
}

async function parseBody(res: Response): Promise<unknown> {
	const text = await res.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return { message: text };
	}
}

/**
 * Low-level fetch wrapper.
 *
 * - Attaches `Authorization: Bearer <jwt>` from the session cookie unless
 *   `token` is explicitly passed (use `null` to opt out).
 * - Forces `cache: 'no-store'` for auth-sensitive calls; pass `cache` to override.
 * - Returns a discriminated `ApiResult<T>` — narrow on `res.ok`.
 */
export async function apiFetch<T = unknown>(
	path: string,
	options: ApiFetchOptions = {},
): Promise<ApiResult<T>> {
	const {
		json,
		token: explicitToken,
		throwOnError = false,
		headers,
		cache,
		method,
		...rest
	} = options;

	const token =
		explicitToken === undefined ? await getSessionToken() : explicitToken;

	const finalHeaders = new Headers(headers);
	finalHeaders.set('Accept', 'application/json');
	if (json !== undefined && !finalHeaders.has('Content-Type')) {
		finalHeaders.set('Content-Type', 'application/json');
	}
	if (token) {
		finalHeaders.set('Authorization', `Bearer ${token}`);
	}

	let res: Response;
	try {
		res = await fetch(buildUrl(path), {
			...rest,
			method: method ?? (json !== undefined ? 'POST' : 'GET'),
			headers: finalHeaders,
			body: json !== undefined ? JSON.stringify(json) : undefined,
			cache: cache ?? 'no-store',
		});
	} catch (cause) {
		const message =
			cause instanceof Error ? cause.message : 'Network request failed';
		const error: ApiErrorBody = { message };
		if (process.env.NODE_ENV !== 'production') {
			console.warn(`[api] ${path} — network error: ${message}`);
		}
		if (throwOnError) throw new ApiRequestError(0, error);
		return { ok: false, status: 0, data: null, error };
	}

	const parsed = await parseBody(res);

	if (!res.ok) {
		const error = (parsed as ApiErrorBody) ?? null;
		if (throwOnError) throw new ApiRequestError(res.status, error);
		return { ok: false, status: res.status, data: null, error };
	}

	return { ok: true, status: res.status, data: parsed as T, error: null };
}

/* ----------------------------- Sugar helpers ---------------------------- */

type WithoutMethodOrJson = Omit<ApiFetchOptions, 'method' | 'json'>;

export const api = {
	get: <T = unknown>(path: string, options: WithoutMethodOrJson = {}) =>
		apiFetch<T>(path, { ...options, method: 'GET' }),

	post: <T = unknown>(
		path: string,
		json?: unknown,
		options: WithoutMethodOrJson = {},
	) => apiFetch<T>(path, { ...options, method: 'POST', json }),

	put: <T = unknown>(
		path: string,
		json?: unknown,
		options: WithoutMethodOrJson = {},
	) => apiFetch<T>(path, { ...options, method: 'PUT', json }),

	patch: <T = unknown>(
		path: string,
		json?: unknown,
		options: WithoutMethodOrJson = {},
	) => apiFetch<T>(path, { ...options, method: 'PATCH', json }),

	delete: <T = unknown>(path: string, options: WithoutMethodOrJson = {}) =>
		apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
