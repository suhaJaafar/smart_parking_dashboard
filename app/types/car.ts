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

/**
 * Richer car projection returned by the space-owner endpoints
 * (`/api/owner/cars`, backed by `OwnerCarResource`). Unlike {@link Car} it
 * carries the composed plate, the park the car sits in, and the customer
 * contact — everything the owner dashboard needs to list and manage the cars
 * physically inside their garages.
 */
export interface OwnerCar {
	id: string;
	plate_prefix: string | null;
	car_number: string;
	/** Composed "PREFIX-NUMBER" plate, ready to render. */
	plate: string;
	model: string | null;
	park_id: string | null;
	/** Eager-loaded on every owner-car response. */
	park?: {
		id: string;
		name: string;
	};
	/** Eager-loaded on every owner-car response. */
	customer?: {
		id: string;
		name: string;
		phone_number: string | null;
	};
	created_at?: string;
	updated_at?: string;
}

/** Payload for `POST /api/owner/cars`. */
export interface CreateOwnerCarPayload {
	park_id: string;
	plate_prefix: string;
	car_number: string;
	model?: string;
}

/** Payload for `PUT /api/owner/cars/{id}`. Park moves are not done here. */
export interface UpdateOwnerCarPayload {
	plate_prefix?: string;
	car_number?: string;
	model?: string;
}
