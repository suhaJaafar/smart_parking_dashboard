/**
 * Single source of truth for occupancy thresholds.
 *
 * Used by the admin dashboard KPI tones, parks-table progress bars and the
 * SVG gauge ring so they always agree on what "red / amber / green" means.
 */

export type OccupancyTone = 'positive' | 'warning' | 'danger';

/** Returns the semantic tone for a percentage in [0, 100]. */
export function occupancyTone(pct: number): OccupancyTone {
	if (pct >= 90) return 'danger';
	if (pct >= 70) return 'warning';
	return 'positive';
}

/** Tailwind background class for a thin progress bar, indexed by tone. */
export const OCCUPANCY_BAR_CLASS: Record<OccupancyTone, string> = {
	positive: 'bg-emerald-500',
	warning: 'bg-amber-500',
	danger: 'bg-red-500',
};

/** Raw hex colors for SVG / canvas use (Recharts, gauge ring). */
export const OCCUPANCY_HEX: Record<OccupancyTone, string> = {
	positive: '#16a34a',
	warning: '#f59e0b',
	danger: '#dc2626',
};

/** Convenience: derive the percentage from raw counts. */
export function occupancyPct(capacity: number, freeSpaces: number): number {
	if (capacity <= 0) return 0;
	const occupied = Math.max(0, capacity - freeSpaces);
	return (occupied / capacity) * 100;
}
