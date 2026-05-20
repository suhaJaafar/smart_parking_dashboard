import type { Country } from '@/app/types/country';
import type { State } from '@/app/types/state';

/** Shape returned by `GET /api/geocode/reverse` and the LocationPicker. */
export interface ReverseGeocodeResult {
	latitude: number;
	longitude: number;
	country: Country;
	state: State | null;
	city: string | null;
	postal_code: string | null;
	display_name: string;
}
