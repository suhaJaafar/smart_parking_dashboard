import { isSpaceOwner } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';

/**
 * Authorization for the owner "customers" surface — the people who have
 * reserved at the owner's garages. Mirrors the Laravel route guard
 * (`role:SPACE_OWNER,SUPER_ADMIN`); the backend scopes every query to the
 * caller's own parks independently.
 */
export function canViewParkUsers(user: User | null | undefined): boolean {
	return isSpaceOwner(user);
}
