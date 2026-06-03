/**
 * Car entity as returned by `CarResource`.
 *
 * The backend eager-loads `cars.user` on `GET /api/parks/{id}` but the
 * resource currently exposes only the columns below. `user` is typed as
 * optional so the UI can render it gracefully if the resource is later
 * extended without requiring a frontend change.
 */
export interface Car {
	id: string;
	model: string;
	car_number: string;
	park_id: string | null;
	plate_prefix?: string | null;
	user?: {
		id: string;
		name: string;
		email: string;
	} | null;
}
