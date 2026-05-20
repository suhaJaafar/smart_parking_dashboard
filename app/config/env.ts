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

export const env = parsed.data;
export type Env = typeof env;
