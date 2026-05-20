import type { Country } from './country';
import type { State } from './state';

/**
 * Country / state are serialised by the backend as `{ value, label }` —
 * see `App\Http\Resources\LocationResource`.
 */
export interface EnumValue<T extends number = number> {
	value: T;
	label: string;
}

/** Location entity as returned by the API. */
export interface Location {
	id: string;
	country: EnumValue<Country> | null;
	state: EnumValue<State> | null;
	city: string | null;
	postal_code: string | null;
	latitude: number;
	longitude: number;
	extra_details: string | null;
	created_at?: string;
	updated_at?: string;
}
