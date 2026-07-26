import { isSpaceOwner } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';

/**
 * Authorization rule for the owner reservations surface.
 *
 * Mirrors the Laravel routes wrapped in `role:SPACE_OWNER,SUPER_ADMIN`. A
 * space owner may view and manage the reservations targeting their own
 * garages; the backend independently scopes every query to the owner's
 * parks and returns 404 for cross-owner ids.
 *
 * There is no "delete reservation" capability by design — reservations only
 * transition between statuses (waiting → cancelled, active → completed).
 */
export function canManageOwnerReservations(
	user: User | null | undefined,
): boolean {
	return isSpaceOwner(user);
}
