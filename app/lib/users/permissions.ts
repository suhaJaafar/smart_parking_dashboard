import { isSuperAdmin } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';

/**
 * Authorization rules for the privileged user-management surface.
 *
 * Mirrors the Laravel routes which are wrapped in `role:SUPER_ADMIN`. Any
 * lower-privileged actor that somehow reaches a guarded page will be bounced
 * to the dashboard home; a 403 from the backend is a defence-in-depth.
 */

export function canManageUsers(user: User | null | undefined): boolean {
	return isSuperAdmin(user);
}

/** Whether the actor may delete the given target user. Self-delete is blocked. */
export function canDeleteUser(
	actor: User | null | undefined,
	target: Pick<User, 'id'>,
): boolean {
	if (!canManageUsers(actor)) return false;
	return actor!.id !== target.id;
}
