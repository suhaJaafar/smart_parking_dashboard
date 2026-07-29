import { proxyCsvExport } from '@/app/lib/exports/proxy';

/**
 * `GET /api/exports/park-cars` — authenticated CSV export of the historical
 * parking sessions (cars that entered a garage and have since left).
 */
export function GET(request: Request) {
	return proxyCsvExport(request, '/api/owner/park-cars/history/export', [
		'from',
		'to',
		'park_id',
	]);
}
