/**
 * Human-friendly duration formatting for the reservations analytics UI.
 *
 * All inputs are in MINUTES because that's the unit the backend returns
 * (see `ReservationStatsService::secondsToMinutes()`).
 */

/**
 * "1h 23m", "45m", "2h", "12h 4m", "3d 5h" — compact, RTL-safe (no i18n),
 * good for KPI tiles and table cells. `null` → em-dash placeholder.
 */
export function formatDurationMinutes(
	minutes: number | null | undefined,
): string {
	if (minutes === null || minutes === undefined) return '—';
	if (!Number.isFinite(minutes) || minutes < 0) return '—';

	const total = Math.round(minutes);
	if (total < 1) return '< 1 min';

	const days = Math.floor(total / (60 * 24));
	const hours = Math.floor((total % (60 * 24)) / 60);
	const mins = total % 60;

	if (days > 0) {
		return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
	}
	if (hours > 0) {
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}
	return `${mins}m`;
}

/**
 * Reformat an ISO string as a compact local date+time. Falls back to the
 * em-dash on nulls / invalid input so the UI never renders "Invalid Date".
 */
export function formatIsoDateTime(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(d);
}

/** Compact date-only rendering for the range banner (e.g. "Jul 26, 2026"). */
export function formatIsoDate(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}).format(d);
}

/** ISO `YYYY-MM-DD` in the browser's local timezone. Used for `<input type='date'>`. */
export function toIsoDateInput(iso: string | null | undefined): string {
	if (!iso) return '';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '';
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}
