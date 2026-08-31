import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type { Paginated } from '@/app/types/pagination';
import type { Park, ParkApprovalStatus } from '@/app/types/park';

/**
 * Server-only data access for the garage review queue.
 *
 * The Laravel `/api/admin/park-approvals` routes sit behind
 * `role:ADMIN,SUPER_ADMIN`. Callers should still gate their fetch with
 * `canReviewParks(user)` rather than rely on a 403 bubbling up.
 */

/** Page through garages in a given review state (pending by default). */
export function listParkApprovals(
	options: {
		page?: number;
		perPage?: number;
		status?: ParkApprovalStatus;
	} = {},
): Promise<ApiResult<Paginated<Park>>> {
	const { page = 1, perPage = 20, status = 'pending' } = options;

	const qs = new URLSearchParams({
		page: String(page),
		per_page: String(perPage),
		status,
	});

	return api.get<Paginated<Park>>(
		`${endpoints.admin.parkApprovals}?${qs.toString()}`,
	);
}

/** Clear a garage for business — also grants its owner the SPACE_OWNER role. */
export function approvePark(id: string): Promise<ApiResult<unknown>> {
	return api.post<unknown>(endpoints.admin.approvePark(id));
}

/** Refuse a garage. The reason, when given, is relayed to the owner verbatim. */
export function rejectPark(
	id: string,
	reason?: string,
): Promise<ApiResult<unknown>> {
	return api.post<unknown>(
		endpoints.admin.rejectPark(id),
		reason ? { reason } : {},
	);
}
