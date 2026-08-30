import type { Coordinates } from '@/app/types/miniapp';

/**
 * Hand-off links to real navigation apps.
 *
 * Turn-by-turn is deliberately *not* attempted inside the Mini App: a WebView
 * has no background location, drains the battery, and would need a paid
 * routing API. Every phone already has a navigator that does this better, so
 * the app's job is to get the driver into it with the destination pre-filled.
 */

export type NavigationApp = 'google' | 'waze';

/**
 * Google Maps takes an explicit origin, so the route is drawn from where the
 * driver was standing when they picked the garage rather than from wherever
 * the maps app last thought they were.
 */
export function googleDirectionsUrl(
	destination: Coordinates,
	origin?: Coordinates | null,
): string {
	const params = new URLSearchParams({
		api: '1',
		destination: `${destination.latitude},${destination.longitude}`,
		travelmode: 'driving',
	});

	if (origin) {
		params.set('origin', `${origin.latitude},${origin.longitude}`);
	}

	return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Waze has no origin parameter — it always routes from the live GPS fix,
 * which is the correct behaviour once the driver is actually moving.
 */
export function wazeDirectionsUrl(destination: Coordinates): string {
	const params = new URLSearchParams({
		ll: `${destination.latitude},${destination.longitude}`,
		navigate: 'yes',
	});

	return `https://waze.com/ul?${params.toString()}`;
}

export function directionsUrl(
	app: NavigationApp,
	destination: Coordinates,
	origin?: Coordinates | null,
): string {
	return app === 'waze'
		? wazeDirectionsUrl(destination)
		: googleDirectionsUrl(destination, origin);
}
