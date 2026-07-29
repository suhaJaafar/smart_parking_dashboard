import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type { ParkUsersPage } from '@/app/types/park-user';

/**
 * Server-only data access for the owner's customers — everyone who has ever
 * reserved at one of their garages.
 *
 * The Laravel `/api/owner/park-users` endpoint is protected by
 * `role:SPACE_OWNER,SUPER_ADMIN` and always scoped to the caller's
 * `ownedParks()`.
 */
export function listParkUsers(
	options: {
		page?: number;
		parkId?: string;
		from?: string;
		to?: string;
	} = {},
): Promise<ApiResult<ParkUsersPage>> {
	const { page = 1, parkId, from, to } = options;
	const qs = new URLSearchParams({ page: String(page) });
	if (parkId) qs.set('park_id', parkId);
	if (from) qs.set('from', from);
	if (to) qs.set('to', to);
	return api.get<ParkUsersPage>(
		`${endpoints.owner.parkUsers}?${qs.toString()}`,
	);
}
