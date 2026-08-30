import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type {
	OwnerReservation,
	OwnerReservationsPage,
	ReservationFilter,
} from '@/app/types/reservation';

/**
 * Server-only data access for the reservations sitting inside the signed-in
 * owner's garages.
 *
 * The Laravel `/api/owner/reservations` endpoints are protected by
 * `role:SPACE_OWNER,SUPER_ADMIN` and are always scoped to the caller's
 * `ownedParks()`. Callers should still gate their fetch with
 * `canManageOwnerReservations(user)` rather than rely on the 403.
 */

/**
 * Page through the owner's reservations, optionally filtered to a single
 * garage or a lifecycle bucket. `filter` mirrors
 * {@see OwnerReservationController::applyFilter}: `live` (holds still valid
 * plus everything active), `waiting`, `active`, `history` (completed +
 * expired + cancelled), or `all`.
 */
export function listOwnerReservations(
	options: {
		page?: number;
		parkId?: string;
		filter?: ReservationFilter;
	} = {},
): Promise<ApiResult<OwnerReservationsPage>> {
	const { page = 1, parkId, filter } = options;
	const qs = new URLSearchParams({ page: String(page) });
	if (parkId) qs.set('park_id', parkId);
	if (filter) qs.set('filter', filter);
	return api.get<OwnerReservationsPage>(
		`${endpoints.owner.reservations.list}?${qs.toString()}`,
	);
}

export function getOwnerReservation(
	id: string,
): Promise<ApiResult<{ data: OwnerReservation }>> {
	return api.get<{ data: OwnerReservation }>(
		endpoints.owner.reservations.detail(id),
	);
}

/**
 * Cancel a still-waiting reservation. The backend mirrors
 * `ReservationService::cancel` — flips `status` to CANCELLED, notifies the
 * customer, and never frees any physical slot (no car was inside).
 */
export function cancelOwnerReservation(
	id: string,
): Promise<ApiResult<{ message: string; data: OwnerReservation }>> {
	return api.post<{ message: string; data: OwnerReservation }>(
		endpoints.owner.reservations.cancel(id),
	);
}

/**
 * Admit an arriving customer: parks their car (claiming the slot) and flips
 * the hold START → ACTIVE, mirroring the bot's `CarEntryFlow`. A plate is
 * only required when the customer has no vehicle on file.
 */
export function admitOwnerReservation(
	id: string,
	plate?: { plate_prefix: string; car_number: string },
): Promise<ApiResult<{ message: string; data: OwnerReservation }>> {
	return api.post<{ message: string; data: OwnerReservation }>(
		endpoints.owner.reservations.admit(id),
		plate ?? {},
	);
}

/**
 * Mark an ACTIVE reservation as completed, exactly like driving the car out
 * from the bot: `CarService::exitPark` frees the slot and nulls
 * `car.park_id`, then `ReservationService::markCompleted` flips the row to
 * COMPLETED.
 */
export function exitOwnerReservation(
	id: string,
): Promise<ApiResult<{ message: string; data: OwnerReservation }>> {
	return api.post<{ message: string; data: OwnerReservation }>(
		endpoints.owner.reservations.exit(id),
	);
}
