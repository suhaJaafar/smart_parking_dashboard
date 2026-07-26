import type { Paginated } from '@/app/types/pagination';

/**
 * Numeric status codes as stored by the backend `Reserve.status` column.
 * Kept in sync with `App\Models\Reserve` STATUS_* constants.
 */
export const ReservationStatus = {
	START: 1,
	ACTIVE: 2,
	COMPLETED: 4,
	EXPIRED: 5,
	CANCELLED: 7,
} as const;

export type ReservationStatusCode =
	(typeof ReservationStatus)[keyof typeof ReservationStatus];

/**
 * Human-friendly status slug derived on the backend
 * ({@see App\Http\Resources\OwnerReservationResource::statusLabel}).
 *
 * `waiting` and `lapsed` both correspond to numeric status = START; the
 * split lets the UI show a distinct badge for holds that are past their
 * 10-minute TTL but haven't been swept yet.
 */
export type ReservationStatusLabel =
	| 'waiting'
	| 'lapsed'
	| 'active'
	| 'completed'
	| 'expired'
	| 'cancelled'
	| 'unknown';

/**
 * Owner-facing reservation row returned by `/api/owner/reservations`
 * (backed by `OwnerReservationResource`).
 *
 * `can_cancel` / `can_exit_car` are pre-computed on the server so the UI
 * never has to re-derive the domain rules for enabling/disabling actions.
 */
export interface OwnerReservation {
	id: string;
	status: ReservationStatusCode;
	status_label: ReservationStatusLabel;
	is_pre_booking: boolean;
	booking_code: string | null;
	park_id: string | null;
	park?: {
		id: string;
		name: string;
	};
	customer?: {
		id: string;
		name: string;
		phone_number: string | null;
	};
	car: {
		id: string;
		plate_prefix: string | null;
		car_number: string;
		plate: string;
		model: string | null;
	} | null;
	scheduled_at: string | null;
	expires_at: string | null;
	created_at: string | null;
	updated_at: string | null;
	can_cancel: boolean;
	can_exit_car: boolean;
}

/**
 * Supported values for the `?filter=` query on the reservations list.
 * Mirrors {@see OwnerReservationController::applyFilter}.
 */
export type ReservationFilter =
	| 'live'
	| 'waiting'
	| 'active'
	| 'history'
	| 'all';

export type OwnerReservationsPage = Paginated<OwnerReservation>;
