import { proxyCsvExport } from '@/app/lib/exports/proxy';

/**
 * `GET /api/exports/reservations` — authenticated CSV export of the owner's
 * reservations, mirroring the on-screen filter + garage + date window.
 */
export function GET(request: Request) {
	return proxyCsvExport(request, '/api/owner/reservations/export', [
		'from',
		'to',
		'park_id',
		'filter',
	]);
}
