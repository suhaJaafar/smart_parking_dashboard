import type { Location } from '@/app/types/location';

/**
 * Format a `Location` as a single human-readable string.
 *
 * The dashboard never shows raw lat/lng to end users — those values are an
 * implementation detail of how the point is *stored*. This helper composes
 * the most specific available label from the structured address fields and
 * falls back to raw coordinates only as a last resort.
 *
 *   "Buhriz, Diyala, Iraq"
 *   "Baghdad, Iraq"
 *   "Iraq"
 *   "33.634631, 44.626465"   // fallback only when nothing else is known
 *
 * Why a frontend formatter (rather than a backend column)?
 *   - Storage stays canonical: the source of truth is still latitude/longitude.
 *   - Labels follow user language / enum changes without DB migrations.
 *   - The API contract (the `Location` resource) is unchanged.
 */
export function formatLocationName(
	location: Location | null | undefined,
): string {
	if (!location) return '_';

	const parts = [
		location.city ?? null,
		location.state?.label ?? null,
		location.country?.label ?? null,
	]
		.map((p) => p?.trim())
		.filter((p): p is string => Boolean(p));

	if (parts.length > 0) return parts.join(', ');

	if (
		Number.isFinite(location.latitude) &&
		Number.isFinite(location.longitude)
	) {
		return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
	}

	return '_';
}

/** Short form: omits the country when a more specific component is available. */
export function formatLocationShort(
	location: Location | null | undefined,
): string {
	if (!location) return '_';
	const specific = location.city ?? location.state?.label;
	if (specific) return specific;
	return formatLocationName(location);
}
