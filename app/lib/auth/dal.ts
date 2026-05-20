import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { authConfig } from '@/app/config/auth';
import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import { hasAnyRole } from '@/app/lib/auth/permissions';
import { getSessionToken } from '@/app/lib/auth/session';
import type { RoleType } from '@/app/types/role';
import type { User } from '@/app/types/user';

/**
 * Data Access Layer for auth.
 *
 * `getCurrentUser` is the single entrypoint for "who is the request actor?".
 * It is memoised per-render via `React.cache`, so repeated calls in a single
 * render pass hit Laravel at most once.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
	const token = await getSessionToken();
	if (!token) return null;

	const res = await api.get<User>(endpoints.auth.me);

	if (!res.ok) return null;
	return res.data;
});

/** Require an authenticated user or redirect to the login page. */
export async function requireAuth(): Promise<User> {
	const user = await getCurrentUser();
	if (!user) redirect(authConfig.routes.login);
	return user;
}

/**
 * Require the user to have at least one of the given roles.
 * - Unauthenticated → redirect to login.
 * - Forbidden → redirect to `options.forbiddenRedirect` (default `/dashboard`).
 */
export async function requireRole(
	allowed: readonly RoleType[],
	options: { forbiddenRedirect?: string } = {},
): Promise<User> {
	const user = await requireAuth();
	if (!hasAnyRole(user, allowed)) {
		redirect(options.forbiddenRedirect ?? authConfig.routes.forbidden);
	}
	return user;
}
