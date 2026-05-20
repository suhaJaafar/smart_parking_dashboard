import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type { Paginated } from '@/app/types/pagination';
import type {
	CreateUserPayload,
	UpdateUserPayload,
	User,
} from '@/app/types/user';

/**
 * Server-only Users data access.
 *
 * The Laravel `/api/users` endpoints are protected by `role:SUPER_ADMIN` —
 * any call from a less-privileged context will receive a 403. Callers should
 * gate their data fetch with `canManageUsers(user)` rather than rely on the
 * 403 to bubble up.
 */

/**
 * Page through the users index. `perPage` is honoured by the backend up to a
 * hard cap of 100 so picker UIs can grab a fuller slice in one round trip.
 */
export function listUsers(
	options: { page?: number; perPage?: number } = {},
): Promise<ApiResult<Paginated<User>>> {
	const { page = 1, perPage = 100 } = options;
	const qs = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return api.get<Paginated<User>>(`${endpoints.users.list}?${qs.toString()}`);
}

export function getUser(id: string): Promise<ApiResult<{ data: User }>> {
	return api.get<{ data: User }>(endpoints.users.detail(id));
}

export function createUser(
	payload: CreateUserPayload,
): Promise<ApiResult<{ data: User }>> {
	return api.post<{ data: User }>(endpoints.users.list, payload);
}

export function updateUser(
	id: string,
	payload: UpdateUserPayload,
): Promise<ApiResult<{ data: User }>> {
	return api.put<{ data: User }>(endpoints.users.detail(id), payload);
}

export function deleteUser(id: string): Promise<ApiResult<null>> {
	return api.delete<null>(endpoints.users.detail(id));
}
