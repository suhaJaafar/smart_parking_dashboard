import { isAdmin } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';

/** Stats dashboard is gated to SUPER_ADMIN / ADMIN. */
export function canViewDashboardStats(user: User | null | undefined): boolean {
	return isAdmin(user);
}
