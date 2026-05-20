import { isSpaceOwner } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';

/** Owner stats dashboard is gated to SPACE_OWNER. */
export function canViewOwnerStats(user: User | null | undefined): boolean {
	return isSpaceOwner(user);
}
