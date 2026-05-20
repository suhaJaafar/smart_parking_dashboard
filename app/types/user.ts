import type { Role, RoleType } from './role';

/** Authenticated user entity as returned by Laravel `/api/user`. */
export interface User {
	id: string;
	name: string;
	email: string;
	phone_number: string | null;
	location_id?: string | null;
	/** Present only when the backend eager-loads roles. */
	roles?: Role[];
}

/** Payload for `POST /api/users` (SUPER_ADMIN only). */
export interface CreateUserPayload {
	name: string;
	email: string;
	password: string;
	phone_number?: string;
	/** Optional set of `RoleTypes` int values. Defaults to `[USER]` server-side. */
	roles?: RoleType[];
}

/**
 * Payload for `PUT /api/users/{id}` (SUPER_ADMIN only).
 * Every field is optional — only the supplied keys are updated.
 */
export interface UpdateUserPayload {
	name?: string;
	email?: string;
	password?: string;
	phone_number?: string;
	roles?: RoleType[];
}
