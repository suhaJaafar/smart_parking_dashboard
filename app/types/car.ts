/**
 * Car entity as returned by `CarResource`.
 *
 * The backend eager-loads `cars.user` on `GET /api/parks/{id}` and the
 * resource currently exposes only `user.phone_number` for privacy.
 */
export interface Car {
	id: string;
	model: string;
	car_number: string;
	park_id: string | null;
	plate_prefix?: string | null;
	user: {
		phone_number: string;
	};
}
