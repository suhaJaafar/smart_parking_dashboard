import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type { Paginated } from '@/app/types/pagination';
import type { CoOwnerRequest } from '@/app/types/co-owner';

/**
 * Server-only co-owner request data access.
 *
 * The Laravel `/api/owner/co-owner-requests` endpoints are protected by
 * `role:SPACE_OWNER,SUPER_ADMIN` and only ever return requests targeting a
 * garage the caller owns. Callers should still gate their fetch with
 * `canManageCoOwners(user)` rather than rely on the 403 to bubble up.
 */

/** Page through the signed-in owner's pending co-owner requests. */
export function listCoOwnerRequests(
	options: { page?: number; perPage?: number } = {},
): Promise<ApiResult<Paginated<CoOwnerRequest>>> {
	const { page = 1, perPage = 20 } = options;
	const qs = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
	});
	return api.get<Paginated<CoOwnerRequest>>(
		`${endpoints.owner.coOwnerRequests}?${qs.toString()}`,
	);
}

/** Approve a request — links the requester's Telegram chat to the owner. */
export function approveCoOwnerRequest(id: string): Promise<ApiResult<unknown>> {
	return api.post<unknown>(endpoints.owner.approveCoOwnerRequest(id));
}

/** Reject a request — notifies the requester and closes it out. */
export function rejectCoOwnerRequest(id: string): Promise<ApiResult<unknown>> {
	return api.post<unknown>(endpoints.owner.rejectCoOwnerRequest(id));
}
