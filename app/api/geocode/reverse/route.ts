import { NextResponse } from 'next/server';

import { requireAuth } from '@/app/lib/auth/dal';
import { reverseGeocode } from '@/app/lib/geocode/nominatim';

/**
 * `GET /api/geocode/reverse?lat=<n>&lng=<n>`
 *
 * Authenticated proxy in front of OpenStreetMap Nominatim. Returns the
 * coordinates plus a best-effort mapping to our country/state enums so the
 * Add-Park form can pre-fill its dropdowns.
 *
 * Auth is enforced because reverse-geocoding is a privileged action in this
 * app (it's only used inside the dashboard) — this also prevents anonymous
 * traffic from blowing the upstream rate limit on our behalf.
 */
export async function GET(request: Request) {
	await requireAuth();

	const { searchParams } = new URL(request.url);
	const lat = Number(searchParams.get('lat'));
	const lng = Number(searchParams.get('lng'));

	if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
		return NextResponse.json(
			{ error: 'Invalid `lat`. Expected a number in [-90, 90].' },
			{ status: 400 },
		);
	}
	if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
		return NextResponse.json(
			{ error: 'Invalid `lng`. Expected a number in [-180, 180].' },
			{ status: 400 },
		);
	}

	const result = await reverseGeocode(lat, lng);
	return NextResponse.json({ data: result });
}
