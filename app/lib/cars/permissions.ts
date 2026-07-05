import { isSpaceOwner } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';

/**
 * Authorization rule for the owner car surface.
 *
 * Mirrors the Laravel routes wrapped in `role:SPACE_OWNER,SUPER_ADMIN`. A
 * space owner may view and manage the cars inside their own garages; the
 * backend independently scopes every query to the owner's parks.
 */
export function canManageOwnerCars(user: User | null | undefined): boolean {
	return isSpaceOwner(user);
}
