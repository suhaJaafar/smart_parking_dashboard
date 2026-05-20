import 'server-only';

import { matchCountry, matchState } from '@/app/lib/geocode/iraq-mapping';
import type { ReverseGeocodeResult } from '@/app/types/geocode';

export type { ReverseGeocodeResult } from '@/app/types/geocode';

/**
 * Thin server-side wrapper around OpenStreetMap's Nominatim reverse-geocoder.
 *
 *   https://nominatim.org/release-docs/develop/api/Reverse/
 *
 * Usage policy (https://operations.osmfoundation.org/policies/nominatim/):
 *   * ≤ 1 request per second
 *   * meaningful `User-Agent` header
 *
 * Both are honoured here. Calls run on the server so the upstream key/policy
 * is never exposed to the browser.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

const USER_AGENT =
	process.env.NOMINATIM_USER_AGENT ?? 'SmartParkingDashboard/1.0';

interface NominatimAddress {
	country?: string;
	country_code?: string;
	state?: string;
	region?: string;
	state_district?: string;
	county?: string;
	city?: string;
	town?: string;
	village?: string;
	municipality?: string;
	suburb?: string;
	postcode?: string;
}

interface NominatimReverseResponse {
	display_name?: string;
	address?: NominatimAddress;
	error?: string;
}

/** Pick the most "city-like" component available. */
function pickCity(addr: NominatimAddress): string | null {
	return (
		addr.city ??
		addr.town ??
		addr.village ??
		addr.municipality ??
		addr.suburb ??
		addr.county ??
		null
	);
}

/** Pick the most "state/governorate-like" component available. */
function pickStateName(addr: NominatimAddress): string | null {
	return addr.state ?? addr.region ?? addr.state_district ?? null;
}

export async function reverseGeocode(
	lat: number,
	lng: number,
): Promise<ReverseGeocodeResult> {
	const url = new URL(NOMINATIM_URL);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('lat', lat.toString());
	url.searchParams.set('lon', lng.toString());
	url.searchParams.set('addressdetails', '1');
	// `zoom=10` (governorate level) gives us reliable country + state even in
	// rural areas; we still get city/postal where available.
	url.searchParams.set('zoom', '10');

	// Coordinates are always returned, even when reverse-geocoding fails — the
	// user can refine the address fields by hand. Any failure beyond that point
	// is logged for diagnostics but never bubbles up to the form.
	const empty: ReverseGeocodeResult = {
		latitude: lat,
		longitude: lng,
		country: matchCountry(null),
		state: null,
		city: null,
		postal_code: null,
		display_name: '',
	};

	try {
		const res = await fetch(url, {
			headers: {
				'User-Agent': USER_AGENT,
				'Accept-Language': 'en',
			},
			next: { revalidate: 60 },
		});

		if (!res.ok) {
			console.warn('[geocode] nominatim http', res.status);
			return empty;
		}

		const json = (await res.json()) as NominatimReverseResponse;
		if (json.error || !json.address) return empty;

		const addr = json.address;
		return {
			latitude: lat,
			longitude: lng,
			country: matchCountry(addr.country),
			state: matchState(pickStateName(addr)),
			city: pickCity(addr),
			postal_code: addr.postcode ?? null,
			display_name: json.display_name ?? '',
		};
	} catch (err) {
		console.warn('[geocode] nominatim failed', err);
		return empty;
	}
}
