import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type { DashboardStats } from '@/app/types/stats';

/** Aggregated platform metrics for the admin dashboard. */
export function getDashboardStats(): Promise<
	ApiResult<{ data: DashboardStats }>
> {
	return api.get<{ data: DashboardStats }>(endpoints.admin.stats);
}
