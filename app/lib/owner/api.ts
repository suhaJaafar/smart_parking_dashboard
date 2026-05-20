import 'server-only';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { ApiResult } from '@/app/types/api';
import type { OwnerStats } from '@/app/types/stats';

/** Aggregated portfolio metrics for the signed-in space owner. */
export function getOwnerStats(): Promise<ApiResult<{ data: OwnerStats }>> {
	return api.get<{ data: OwnerStats }>(endpoints.owner.stats);
}
