import type {
	ReservationStatusCode,
	ReservationStatusLabel,
} from '@/app/types/reservation';

/**
 * Shape of `GET /api/owner/reservation-stats` and `GET /api/admin/reservation-stats`.
 * Keep in sync with `App\Services\ReservationStatsService::report()`.
 *
 * The two endpoints return the exact same payload; the only difference is
 * scope (owner's parks vs. every park on the platform).
 */

export interface ReservationStatsRange {
	from: string;
	to: string;
}

export interface ReservationStatsTotals {
	total_reservations: number;
	completed: number;
	cancelled: number;
	expired: number;
	active: number;
	waiting: number;
	pre_booking: number;
	on_site: number;
	unique_customers: number;
	/**
	 * Average end-to-end duration in MINUTES for `COMPLETED` reservations.
	 * `null` when there were no completed reservations in the window.
	 */
	avg_duration_minutes: number | null;
	/** Sum of all completed-reservation durations, in minutes. */
	total_duration_minutes: number;
	/** 0–100. Completed / total_reservations. */
	completion_rate: number;
	/** 0–100. Cancelled / total_reservations. */
	cancellation_rate: number;
}

export interface ReservationStatusBreakdown {
	status: ReservationStatusCode;
	label: string;
	count: number;
}

export interface ReservationByDay {
	/** ISO date `YYYY-MM-DD`. Every day in the range is present (zero-filled). */
	date: string;
	count: number;
	completed: number;
}

export interface ReservationByHour {
	/** 0–23. */
	hour: number;
	count: number;
}

export interface ReservationByPark {
	park_id: string;
	name: string;
	count: number;
	avg_duration_minutes: number | null;
}

export interface ReservationDurationBucket {
	label: string;
	from_min: number;
	/** `null` means "and above" (the tail bucket). */
	to_min: number | null;
	count: number;
}

export interface ReservationDetailRow {
	id: string;
	booking_code: string | null;
	status: ReservationStatusCode;
	status_label: ReservationStatusLabel;
	is_pre_booking: boolean;
	park: { id: string; name: string } | null;
	customer: {
		id: string;
		name: string;
		phone_number: string | null;
	} | null;
	car: { id: string; plate: string } | null;
	from_iso: string;
	to_iso: string | null;
	duration_minutes: number | null;
}

export interface ReservationStats {
	range: ReservationStatsRange;
	totals: ReservationStatsTotals;
	by_status: ReservationStatusBreakdown[];
	by_day: ReservationByDay[];
	by_hour: ReservationByHour[];
	by_park: ReservationByPark[];
	duration_buckets: ReservationDurationBucket[];
	recent: ReservationDetailRow[];
}

/** Input query for the two stats endpoints. */
export interface ReservationStatsFilter {
	/** ISO date `YYYY-MM-DD`. */
	from?: string;
	/** ISO date `YYYY-MM-DD`. */
	to?: string;
	park_id?: string;
}

/**
 * Which backend endpoint a page targets. Chosen server-side based on the
 * viewer's role (SUPER_ADMIN / ADMIN → 'admin', SPACE_OWNER → 'owner').
 */
export type ReservationStatsScope = 'owner' | 'admin';
