import { RoleType } from '@/app/types/role';
import type { User } from '@/app/types/user';

/** Extract the set of role ids the user holds. */
function roleIdsOf(user: User | null | undefined): Set<RoleType> {
	if (!user?.roles?.length) return new Set();
	return new Set(user.roles.map((r) => Number(r.role) as RoleType));
}

/** Does the user hold the given role? */
export function hasRole(
	user: User | null | undefined,
	role: RoleType,
): boolean {
	return roleIdsOf(user).has(role);
}

/** Does the user hold at least one of the given roles? */
export function hasAnyRole(
	user: User | null | undefined,
	allowed: readonly RoleType[],
): boolean {
	const ids = roleIdsOf(user);
	return allowed.some((r) => ids.has(r));
}

/** Does the user hold *every* one of the given roles? */
export function hasAllRoles(
	user: User | null | undefined,
	required: readonly RoleType[],
): boolean {
	const ids = roleIdsOf(user);
	return required.every((r) => ids.has(r));
}

export const isSuperAdmin = (user: User | null | undefined): boolean =>
	hasRole(user, RoleType.SUPER_ADMIN);

export const isAdmin = (user: User | null | undefined): boolean =>
	hasAnyRole(user, [RoleType.SUPER_ADMIN, RoleType.ADMIN]);

export const isSpaceOwner = (user: User | null | undefined): boolean =>
	hasRole(user, RoleType.SPACE_OWNER);

export const isCustomer = (user: User | null | undefined): boolean =>
	hasRole(user, RoleType.CUSTOMER);
