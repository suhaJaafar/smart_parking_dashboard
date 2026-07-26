import { isAdmin, isSpaceOwner } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';
import type { ReservationStatsScope } from '@/app/types/reservation-stats';

/**
 * Authorization for the reservations-analytics surface.
 *
 * - SPACE_OWNER sees THEIR own parks (`scope = 'owner'`).
 * - ADMIN / SUPER_ADMIN sees EVERY park (`scope = 'admin'`).
 * - A user who happens to hold both roles falls through to the admin view
 *   by default so the report shows the platform-wide picture; the page
 *   still surfaces a toggle so they can inspect just their own parks.
 */

export function canViewOwnerReservationStats(
	user: User | null | undefined,
): boolean {
	return isSpaceOwner(user);
}

export function canViewAdminReservationStats(
	user: User | null | undefined,
): boolean {
	return isAdmin(user);
}

export function canViewAnyReservationStats(
	user: User | null | undefined,
): boolean {
	return (
		canViewAdminReservationStats(user) || canViewOwnerReservationStats(user)
	);
}

/**
 * Pick the default scope for a viewer. Admin wins when both roles are
 * present, matching the "see the whole platform" expectation.
 */
export function defaultReservationStatsScope(
	user: User | null | undefined,
): ReservationStatsScope | null {
	if (canViewAdminReservationStats(user)) return 'admin';
	if (canViewOwnerReservationStats(user)) return 'owner';
	return null;
}
