import { isAdmin, isSuperAdmin } from '@/app/lib/auth/permissions';
import type { Park } from '@/app/types/park';
import type { User } from '@/app/types/user';

/**
 * Park-level authorization rules. Mirror the backend semantics:
 *
 * - Anyone authenticated can VIEW the public parks list.
 * - SUPER_ADMIN / ADMIN see all parks; everyone else sees only their own.
 * - Owner can manage their own park. SUPER_ADMIN is *intended* to manage any
 *   park (but the backend currently restricts this — see README note).
 */

export function canViewAllParks(user: User | null | undefined): boolean {
	return isAdmin(user); // SUPER_ADMIN or ADMIN
}

export function isParkOwner(
	user: User | null | undefined,
	park: Pick<Park, 'user_id'> | null | undefined,
): boolean {
	if (!user || !park) return false;
	return park.user_id === user.id;
}

export function canManagePark(
	user: User | null | undefined,
	park: Pick<Park, 'user_id'> | null | undefined,
): boolean {
	return isSuperAdmin(user) || isParkOwner(user, park);
}

/** Anyone authenticated can create a park — the backend auto-promotes them. */
export function canCreatePark(user: User | null | undefined): boolean {
	return !!user;
}

/**
 * Whether the user is allowed to assign a park to *another* user on create.
 * Mirrors the backend rule in `StoreParkRequest::canAssignOwner`.
 */
export function canAssignParkOwner(user: User | null | undefined): boolean {
	return isSuperAdmin(user);
}
