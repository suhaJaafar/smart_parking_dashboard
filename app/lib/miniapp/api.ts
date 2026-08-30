import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type {
	Coordinates,
	CustomerReservation,
	HistoryFilter,
	NearbyPark,
	ReservationHistoryPage,
} from '@/app/types/miniapp';

/**
 * Server-side data access for the customer Mini App.
 *
 * Thin wrappers over the Laravel endpoints, mirroring `lib/owner/api.ts`.
 * Every call inherits the JWT from the session cookie via `apiFetch`.
 */

/** How far to search, and how many results to show, by default. */
export const NEARBY_DEFAULT_RADIUS_M = 5000;
export const NEARBY_DEFAULT_LIMIT = 20;

export function listNearbyParks(
	{ latitude, longitude }: Coordinates,
	options: { radius?: number; limit?: number } = {},
): Promise<ApiResult<{ data: NearbyPark[] }>> {
	const params = new URLSearchParams({
		latitude: String(latitude),
		longitude: String(longitude),
		radius: String(options.radius ?? NEARBY_DEFAULT_RADIUS_M),
		limit: String(options.limit ?? NEARBY_DEFAULT_LIMIT),
	});

	return api.get<{ data: NearbyPark[] }>(
		`${endpoints.customer.nearbyParks}?${params.toString()}`,
	);
}

/** The caller's live hold or in-progress stay, or `data: null` when idle. */
export function getActiveReservation(): Promise<
	ApiResult<{ data: CustomerReservation | null }>
> {
	return api.get<{ data: CustomerReservation | null }>(
		endpoints.customer.reservations.active,
	);
}

export function createReservation(payload: {
	park_id: string;
	scheduled_at?: string;
}): Promise<ApiResult<{ data: CustomerReservation }>> {
	return api.post<{ data: CustomerReservation }>(
		endpoints.customer.reservations.create,
		payload,
	);
}

export function cancelReservation(
	id: string,
): Promise<ApiResult<{ data: CustomerReservation }>> {
	return api.post<{ data: CustomerReservation }>(
		endpoints.customer.reservations.cancel(id),
	);
}

/** How many log entries load at a time. */
export const HISTORY_PAGE_SIZE = 15;

/** Settled bookings, newest first, with lifetime totals attached. */
export function listReservationHistory(
	options: { filter?: HistoryFilter; page?: number } = {},
): Promise<ApiResult<ReservationHistoryPage>> {
	const params = new URLSearchParams({
		filter: options.filter ?? 'all',
		page: String(options.page ?? 1),
		per_page: String(HISTORY_PAGE_SIZE),
	});

	return api.get<ReservationHistoryPage>(
		`${endpoints.customer.reservations.history}?${params.toString()}`,
	);
}
