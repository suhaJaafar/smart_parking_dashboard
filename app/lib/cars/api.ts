import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type {
	CreateOwnerCarPayload,
	OwnerCar,
	OwnerCarsPage,
	ParkCarHistoryPage,
	UpdateOwnerCarPayload,
} from '@/app/types/car';

/**
 * Server-only data access for the cars inside the signed-in owner's garages.
 *
 * The Laravel `/api/owner/cars` endpoints are protected by
 * `role:SPACE_OWNER,SUPER_ADMIN` and only ever return cars parked in a garage
 * the caller owns. Callers should still gate their fetch with
 * `canManageOwnerCars(user)` rather than rely on the 403 to bubble up.
 */

/**
 * Page through the owner's parked cars, optionally filtered to a single
 * garage. The response also carries the cars still *waiting to enter* (holds
 * that reserved a slot but haven't driven in) under `waiting`.
 */
export function listOwnerCars(
	options: { page?: number; parkId?: string } = {},
): Promise<ApiResult<OwnerCarsPage>> {
	const { page = 1, parkId } = options;
	const qs = new URLSearchParams({ page: String(page) });
	if (parkId) qs.set('park_id', parkId);
	return api.get<OwnerCarsPage>(
		`${endpoints.owner.cars.list}?${qs.toString()}`,
	);
}

export function getOwnerCar(
	id: string,
): Promise<ApiResult<{ data: OwnerCar }>> {
	return api.get<{ data: OwnerCar }>(endpoints.owner.cars.detail(id));
}

export function createOwnerCar(
	payload: CreateOwnerCarPayload,
): Promise<ApiResult<{ data: OwnerCar }>> {
	return api.post<{ data: OwnerCar }>(endpoints.owner.cars.create, payload);
}

export function updateOwnerCar(
	id: string,
	payload: UpdateOwnerCarPayload,
): Promise<ApiResult<{ data: OwnerCar }>> {
	return api.put<{ data: OwnerCar }>(endpoints.owner.cars.update(id), payload);
}

export function deleteOwnerCar(id: string): Promise<ApiResult<null>> {
	return api.delete<null>(endpoints.owner.cars.remove(id));
}

/**
 * Page through the historical parking sessions — cars that entered one of the
 * owner's garages and have since left. Optionally scoped to a single garage
 * and a date window. This is the audit trail, NOT the currently-parked cars.
 */
export function listOwnerParkCarHistory(
	options: {
		page?: number;
		parkId?: string;
		from?: string;
		to?: string;
	} = {},
): Promise<ApiResult<ParkCarHistoryPage>> {
	const { page = 1, parkId, from, to } = options;
	const qs = new URLSearchParams({ page: String(page) });
	if (parkId) qs.set('park_id', parkId);
	if (from) qs.set('from', from);
	if (to) qs.set('to', to);
	return api.get<ParkCarHistoryPage>(
		`${endpoints.owner.cars.history}?${qs.toString()}`,
	);
}
