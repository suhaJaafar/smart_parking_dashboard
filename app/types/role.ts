/**
 * Role type — mirrors Laravel's `App\Enums\RoleTypes` (int-backed enum).
 *
 * Keep the numeric values in sync with the backend enum:
 *   1 = SUPER_ADMIN, 2 = ADMIN, 3 = SPACE_OWNER, 4 = CUSTOMER, 5 = USER
 */
export enum RoleType {
	SUPER_ADMIN = 1,
	ADMIN = 2,
	SPACE_OWNER = 3,
	CUSTOMER = 4,
	USER = 5,
}

/** Human-readable label for each role. Useful for UI rendering. */
export const ROLE_LABEL: Record<RoleType, string> = {
	[RoleType.SUPER_ADMIN]: 'Super admin',
	[RoleType.ADMIN]: 'Admin',
	[RoleType.SPACE_OWNER]: 'Space owner',
	[RoleType.CUSTOMER]: 'Customer',
	[RoleType.USER]: 'User',
};

/** Role entity as returned by the API (`roles` pivot). */
export interface Role {
	id: number;
	/** Stored as the int value of `RoleTypes` (1..5). */
	role: RoleType;
}
