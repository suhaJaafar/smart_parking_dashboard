import { isSpaceOwner } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';

/**
 * Authorization rule for the co-owner request surface.
 *
 * Mirrors the Laravel routes wrapped in `role:SPACE_OWNER,SUPER_ADMIN`. A
 * space owner may review and decide requests targeting their own garages;
 * the backend independently scopes every query to `owner_id = actor`.
 */
export function canManageCoOwners(user: User | null | undefined): boolean {
	return isSpaceOwner(user);
}
