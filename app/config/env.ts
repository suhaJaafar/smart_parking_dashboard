import { z } from 'zod';

/**
 * Validated environment variables. Failing fast at module load gives clearer
 * errors than silent `undefined` propagation.
 *
 * Use `env.SERVER` for server-only secrets and `env.PUBLIC` for variables that
 * may be referenced from client code (`NEXT_PUBLIC_*`).
 */
const ServerSchema = z.object({
	LARAVEL_API_URL: z
		.string()
		.url()
		.default('http://127.0.0.1:8000')
		.transform((u) => u.replace(/\/+$/, '')),
	SESSION_COOKIE_NAME: z.string().min(1).default('sp_token'),
	SESSION_COOKIE_SECURE: z
		.preprocess((v) => {
			if (typeof v === 'boolean') return v;
			if (typeof v === 'string') {
				const n = v.trim().toLowerCase();
				if (['1', 'true', 'yes', 'on'].includes(n)) return true;
				if (['0', 'false', 'no', 'off'].includes(n)) return false;
			}
			return undefined;
		}, z.boolean())
		.optional(),
	SESSION_MAX_AGE: z.coerce
		.number()
		.int()
		.positive()
		.default(60 * 60 * 24 * 7),
	NODE_ENV: z
		.enum(['development', 'test', 'production'])
		.default('development'),
});

const parsed = ServerSchema.safeParse({
	LARAVEL_API_URL: process.env.LARAVEL_API_URL,
	SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
	SESSION_COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE,
	SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
	NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
	// Surface a readable error during boot.
	const issues = parsed.error.issues
		.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
		.join('\n');
	throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = {
	...parsed.data,
	SESSION_COOKIE_SECURE:
		parsed.data.SESSION_COOKIE_SECURE ?? parsed.data.NODE_ENV === 'production',
} as const;
export type Env = typeof env;
