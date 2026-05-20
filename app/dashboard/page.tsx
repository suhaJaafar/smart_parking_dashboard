import { AdminStatsDashboard } from '@/app/dashboard/_components/admin-stats-dashboard';
import { OwnerHome } from '@/app/dashboard/_components/owner-home';
import { OwnerStatsDashboard } from '@/app/dashboard/_components/owner-stats-dashboard';
import { canViewDashboardStats } from '@/app/lib/admin/permissions';
import { getCurrentUser } from '@/app/lib/auth/dal';
import { canViewOwnerStats } from '@/app/lib/owner/permissions';

/**
 * Dashboard home. Branches by role so each surface stays small and focused:
 *   - ADMIN / SUPER_ADMIN  → platform-wide statistics.
 *   - SPACE_OWNER          → per-owner portfolio statistics.
 *   - Anyone else          → quick-links home with a missing-role notice.
 *
 * Auth is enforced one level up by `app/dashboard/layout.tsx`; `getCurrentUser`
 * is memoised by `React.cache`, so this is a cheap call.
 */
export default async function DashboardPage() {
	const user = await getCurrentUser();
	if (!user) return null;

	if (canViewDashboardStats(user)) {
		return <AdminStatsDashboard userName={user.name} />;
	}

	if (canViewOwnerStats(user)) {
		return <OwnerStatsDashboard userName={user.name} />;
	}

	return <OwnerHome user={user} />;
}
