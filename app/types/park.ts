import type { Country } from './country';
import type { Location } from './location';
import type { State } from './state';

/** Slim owner projection embedded in `ParkResource` when eager-loaded. */
export interface ParkOwner {
	id: string;
	name: string;
	email: string;
}

/** Park entity as returned by `ParkResource`. */
export interface Park {
	id: string;
	name: string;
	user_id: string;
	capacity: number;
	free_spaces: number;
	/** Eager-loaded by the backend on `show`/`store`/`update`. */
	location?: Location | null;
	/** Eager-loaded for admin views (`index`/`show`). */
	owner?: ParkOwner | null;
	created_at?: string;
	updated_at?: string;
}

/** Payload for `POST /api/parks` (flat: park + location in one body). */
export interface CreateParkPayload {
	// park fields
	name: string;
	capacity: number;
	free_spaces?: number;
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
