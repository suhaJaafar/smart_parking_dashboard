import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type { Paginated } from '@/app/types/pagination';
import type {
	CreateParkPayload,
	Park,
	UpdateParkPayload,
} from '@/app/types/park';

/**
 * Server-only Parks data access. All functions return `ApiResult<T>` so call
 * sites can narrow on `res.ok` and handle 403/404 explicitly.
 */

export function listParks(page = 1): Promise<ApiResult<Paginated<Park>>> {
	return api.get<Paginated<Park>>(`${endpoints.parks.list}?page=${page}`);
}

export function listMyParks(page = 1): Promise<ApiResult<Paginated<Park>>> {
	return api.get<Paginated<Park>>(`${endpoints.parks.mine}?page=${page}`);
}

export function getPark(id: string): Promise<ApiResult<{ data: Park }>> {
	// Laravel JsonResource wraps single items in `{ data: ... }`.
	return api.get<{ data: Park }>(endpoints.parks.detail(id));
}

export function createPark(
	payload: CreateParkPayload,
): Promise<ApiResult<{ data: Park }>> {
	return api.post<{ data: Park }>(endpoints.parks.create, payload);
}

export function updatePark(
	id: string,
	payload: UpdateParkPayload,
): Promise<ApiResult<{ data: Park }>> {
	return api.put<{ data: Park }>(endpoints.parks.update(id), payload);
}

export function deletePark(id: string): Promise<ApiResult<null>> {
	return api.delete<null>(endpoints.parks.remove(id));
}
