import type { Coordinates } from '@/app/types/miniapp';

/**
 * One place that owns "where is the user".
 *
 * The screens used to call `navigator.geolocation.getCurrentPosition()` on
 * every mount, which re-opens the permission prompt each time the browser has
 * not persisted a grant. Asking again on every visit reads as broken, so the
 * fix is to ask as rarely as possible: reuse a recent fix, and never call the
 * API at all when we already know the answer will be a refusal.
 */

const CACHE_KEY = 'sp:last-fix';

/** A fix older than this is not worth reusing for a "what's near me" search. */
export const FIX_MAX_AGE_MS = 10 * 60 * 1000;

export type PermissionState = 'granted' | 'prompt' | 'denied' | 'unknown';

interface CachedFix extends Coordinates {
	/** Epoch ms, so staleness survives a reload. */
	at: number;
}

/**
 * Ask the browser what it would do, *without* triggering a prompt.
 *
 * The Permissions API is missing or refuses the `geolocation` name on some
 * WebViews (older iOS Safari in particular), so an unknown answer is normal
 * and must not be treated as a refusal.
 */
export async function getPermissionState(): Promise<PermissionState> {
	if (typeof navigator === 'undefined' || !navigator.permissions) {
		return 'unknown';
	}

	try {
		const status = await navigator.permissions.query({
			name: 'geolocation' as PermissionName,
		});
		return status.state as PermissionState;
	} catch {
		return 'unknown';
	}
}

/**
 * The last known position, if it is still fresh enough to act on.
 *
 * Stored in `localStorage` rather than `sessionStorage` on purpose: Telegram
 * tears the WebView down aggressively, and a session-scoped cache would expire
 * the moment the Mini App closes — exactly the case this is meant to solve.
 */
export function readCachedFix(
	maxAgeMs: number = FIX_MAX_AGE_MS,
): Coordinates | null {
	if (typeof window === 'undefined') return null;

	try {
		const raw = window.localStorage.getItem(CACHE_KEY);
		if (!raw) return null;

		const fix = JSON.parse(raw) as Partial<CachedFix>;
		if (
			typeof fix.latitude !== 'number' ||
			typeof fix.longitude !== 'number' ||
			typeof fix.at !== 'number'
		) {
			return null;
		}

		if (Date.now() - fix.at > maxAgeMs) return null;

		return { latitude: fix.latitude, longitude: fix.longitude };
	} catch {
		// Private mode, quota, or corrupt JSON — a missing cache is never fatal.
		return null;
	}
}

export function writeCachedFix(coords: Coordinates): void {
	if (typeof window === 'undefined') return;

	try {
		const fix: CachedFix = { ...coords, at: Date.now() };
		window.localStorage.setItem(CACHE_KEY, JSON.stringify(fix));
	} catch {
		// Caching is an optimisation; failing to cache must not break the screen.
	}
}

export function clearCachedFix(): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.removeItem(CACHE_KEY);
	} catch {
		/* ignore */
	}
}

export type LocationFailure = 'denied' | 'unavailable';

export type LocationOutcome =
	| { ok: true; coords: Coordinates; fromCache: boolean }
	| { ok: false; reason: LocationFailure };

const GEO_OPTIONS: PositionOptions = {
	enableHighAccuracy: true,
	timeout: 12_000,
	maximumAge: 60_000,
};

/**
 * Resolve the user's position, prompting only when there is no other way.
 *
 * @param maxAgeMs  How stale a cached fix may be. Pass `0` to force a live
 *                  reading — correct when the coordinate *is* the answer, such
 *                  as dropping a pin on the garage you are standing in.
 */
export async function resolvePosition({
	maxAgeMs = FIX_MAX_AGE_MS,
}: { maxAgeMs?: number } = {}): Promise<LocationOutcome> {
	const cached = maxAgeMs > 0 ? readCachedFix(maxAgeMs) : null;
	if (cached) {
		return { ok: true, coords: cached, fromCache: true };
	}

	if (typeof navigator === 'undefined' || !navigator.geolocation) {
		return { ok: false, reason: 'unavailable' };
	}

	// A known refusal is answered without touching the API: calling it would
	// fail instantly anyway, and on some clients it re-shows a system dialog.
	if ((await getPermissionState()) === 'denied') {
		return { ok: false, reason: 'denied' };
	}

	return new Promise<LocationOutcome>((resolve) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const coords: Coordinates = {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude,
				};
				writeCachedFix(coords);
				resolve({ ok: true, coords, fromCache: false });
			},
			(error) => {
				resolve({
					ok: false,
					reason:
						error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
				});
			},
			GEO_OPTIONS,
		);
	});
}
