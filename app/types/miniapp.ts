/**
 * Types for the customer-facing Mini App surface.
 *
 * Mirrors `NearbyParkResource` and `CustomerReservationResource` on the
 * Laravel side — keep them in sync when either resource changes.
 */

/** A park returned by `GET /api/customer/parks/nearby`. */
export interface NearbyPark {
	id: string;
	name: string;
	capacity: number;
	free_spaces: number;
	/** Decimal string, e.g. "5000.000". Formatted for display client-side. */
	price: string | null;
	distance_meters: number | null;
	latitude: number | null;
	longitude: number | null;
}

/** Lifecycle slug from the backend. Authoritative — never re-derived here. */
export type CustomerReservationStatus =
	| 'waiting'
	| 'lapsed'
	| 'active'
	| 'completed'
	| 'expired'
	| 'cancelled'
	| 'unknown';

export interface CustomerReservationPayment {
	status: string;
	amount: string;
	currency: string;
	is_paid: boolean;
	/** `null` when the row predates method tracking. */
	method: string | null;
	is_cash: boolean;
	/** Opened externally via Telegram, never inside the Mini App WebView. */
	pay_url: string;
}

/** The customer's own reservation. */
export interface CustomerReservation {
	id: string;
	status: number;
	status_label: CustomerReservationStatus;
	is_pre_booking: boolean;
	booking_code: string | null;
	park: {
		id: string | null;
		name: string | null;
		price: string | null;
		free_spaces: number | null;
		latitude: number | null;
		longitude: number | null;
	} | null;
	scheduled_at: string | null;
	expires_at: string | null;
	created_at: string | null;
	payment: CustomerReservationPayment | null;
	can_cancel: boolean;
}

/** Coordinates supplied by the browser/Telegram geolocation API. */
export interface Coordinates {
	latitude: number;
	longitude: number;
}

/** Which slice of the log to show. `unpaid` is the only actionable one. */
export type HistoryFilter = 'all' | 'completed' | 'unpaid' | 'cancelled';

/** Lifetime totals — computed over the whole history, not the current page. */
export interface ReservationHistorySummary {
	stays: number;
	/** Decimal strings, matching the payment amounts they aggregate. */
	paid_total: string;
	due_total: string;
	currency: string;
}

export interface ReservationHistoryPage {
	data: CustomerReservation[];
	meta: { current_page: number; last_page: number; total: number };
	summary: ReservationHistorySummary;
}

/**
 * Uniform result for Mini App server actions.
 *
 * Actions return this instead of redirecting: the Mini App is a single-screen
 * experience, so a full navigation on every tap would feel like a website.
 */
export type ActionResult<T> =
	| { ok: true; data: T }
	| {
			ok: false;
			error: string;
			/** Context for the message, e.g. the garage the driver is stuck at. */
			detail?: string;
	  };
