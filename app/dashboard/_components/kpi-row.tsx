import { StatCard } from '@/app/components/stats/stat-card';
import { occupancyTone } from '@/app/lib/stats/occupancy';
import type { DashboardTotals, UsersByRole } from '@/app/types/stats';

/**
 * Headline KPI row shown at the top of the admin dashboard.
 * Tones are driven by the shared `occupancyTone` helper.
 */
export function KpiRow({
	totals,
	usersByRole,
}: {
	totals: DashboardTotals;
	usersByRole: readonly UsersByRole[];
}) {
	const occTone = occupancyTone(totals.occupancy_pct);
	const roleAssignments = usersByRole.reduce((sum, r) => sum + r.count, 0);

	return (
		<section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
			<StatCard
				label='Total parkings'
				value={totals.parks.toLocaleString()}
				hint={`${totals.capacity.toLocaleString()} total spaces`}
			/>
			<StatCard
				label='Registered users'
				value={totals.users.toLocaleString()}
				hint={`${roleAssignments} role assignments`}
			/>
			<StatCard
				label='Occupied spaces'
				value={totals.occupied.toLocaleString()}
				hint={`${totals.free_spaces.toLocaleString()} free`}
				tone={occTone}
			/>
			<StatCard
				label='Occupancy'
				value={`${totals.occupancy_pct.toFixed(1)}%`}
				hint='Across all parkings'
				tone={occTone}
			/>
		</section>
	);
}
