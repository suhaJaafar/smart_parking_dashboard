import { proxyCsvExport } from '@/app/lib/exports/proxy';

/**
 * `GET /api/exports/park-users` — authenticated CSV export of every customer
 * who has reserved at one of the owner's garages, with lifetime activity.
 */
export function GET(request: Request) {
	return proxyCsvExport(request, '/api/owner/park-users/export', [
		'from',
		'to',
		'park_id',
	]);
}
