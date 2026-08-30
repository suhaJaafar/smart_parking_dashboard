import type { Car } from './car';
import type { Country } from './country';
import type { Location } from './location';
import type { State } from './state';

/** Slim owner projection embedded in `ParkResource` when eager-loaded. */
export interface ParkOwner {
	id: string;
	name: string;
	email: string;
}

/** Review state of a garage. Authoritative — never re-derived client-side. */
export type ParkApprovalStatus = 'pending' | 'approved' | 'rejected';

/** Park entity as returned by `ParkResource`. */
export interface Park {
	id: string;
	name: string;
	user_id: string;
	capacity: number;
	free_spaces: number;
	/** Flat per-stay fee, as a decimal string (e.g. "5000.000"). */
	price?: string | null;
	approval_status: ParkApprovalStatus;
	/** Derived by the backend so no client re-encodes which state is live. */
	is_approved: boolean;
	approved_at?: string | null;
	rejection_reason?: string | null;
	/** Eager-loaded by the backend on `show`/`store`/`update`. */
	location?: Location | null;
	/** Eager-loaded for admin views (`index`/`show`). */
	owner?: ParkOwner | null;
	/** Eager-loaded on `show`: cars currently reserved/parked in this park. */
	cars?: Car[];
	created_at?: string;
	updated_at?: string;
}

/** Payload for `POST /api/parks` (flat: park + location in one body). */
export interface CreateParkPayload {
	// park fields
	name: string;
	capacity: number;
	free_spaces?: number;
	/** Flat per-stay fee. Omitted → backend default. */
	price?: number;
	user_id?: string;
	// location fields
	country: Country;
	state: State;
	city?: string;
	postal_code?: string;
	latitude: number;
	longitude: number;
	extra_details?: string;
}

/** Payload for `PUT /api/parks/{id}`. Location is immutable on update. */
export interface UpdateParkPayload {
	name?: string;
	capacity?: number;
	free_spaces?: number;
}
