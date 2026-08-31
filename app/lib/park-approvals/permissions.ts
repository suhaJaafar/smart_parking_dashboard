import { isAdmin } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';

/**
 * Authorization rule for the garage review queue.
 *
 * Mirrors the Laravel routes wrapped in `role:ADMIN,SUPER_ADMIN`. Approving a
 * garage grants its owner the SPACE_OWNER role, so this is a privilege-issuing
 * surface — deliberately narrower than the owner-facing screens.
 */
export function canReviewParks(user: User | null | undefined): boolean {
	return isAdmin(user);
}
