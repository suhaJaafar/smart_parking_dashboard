import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type {
	ReservationStats,
	ReservationStatsFilter,
} from '@/app/types/reservation-stats';

/**
 * Server-only data access for the reservations analytics endpoints.
 *
 * Both routes are protected at the API layer:
 *  - owner: `role:SPACE_OWNER,SUPER_ADMIN` — scoped to the caller's parks.
 *  - admin: `role:ADMIN,SUPER_ADMIN` — scoped to every park on the platform.
 *
 * The page still gates the call with the matching permission helper so a
 * disallowed user never triggers the request in the first place.
 */

function buildQuery(filter: ReservationStatsFilter | undefined): string {
	const params = new URLSearchParams();
	if (filter?.from) params.set('from', filter.from);
	if (filter?.to) params.set('to', filter.to);
	if (filter?.park_id) params.set('park_id', filter.park_id);
	const qs = params.toString();
	return qs ? `?${qs}` : '';
}

/** Reservations analytics scoped to the signed-in space owner's parks. */
export function getOwnerReservationStats(
	filter?: ReservationStatsFilter,
): Promise<ApiResult<{ data: ReservationStats }>> {
	return api.get<{ data: ReservationStats }>(
		`${endpoints.owner.reservationStats}${buildQuery(filter)}`,
	);
}

/** Reservations analytics for every park on the platform (admin surface). */
export function getAdminReservationStats(
	filter?: ReservationStatsFilter,
): Promise<ApiResult<{ data: ReservationStats }>> {
	return api.get<{ data: ReservationStats }>(
		`${endpoints.admin.reservationStats}${buildQuery(filter)}`,
	);
}
