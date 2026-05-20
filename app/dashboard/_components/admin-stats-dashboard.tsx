import Link from 'next/link';

import {
	CategoryBarChart,
	CategoryDonutChart,
	GaugeRing,
} from '@/app/components/stats/charts';
import { PanelCard } from '@/app/components/stats/stat-card';
import { KpiRow } from '@/app/dashboard/_components/kpi-row';
import { RecentParksList } from '@/app/dashboard/_components/recent-parks-list';
import { getDashboardStats } from '@/app/lib/admin/api';

/**
 * Server component: fetches platform stats and renders the admin home.
 *
 * Failure is rendered inline rather than thrown so the dashboard shell
 * (header, sidebar) stays usable when the backend is unreachable.
 */
export async function AdminStatsDashboard({ userName }: { userName: string }) {
	const res = await getDashboardStats();

	if (!res.ok) {
		return (
			<div className='space-y-2'>
				<h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{res.error?.message ?? 'Failed to load statistics.'}
				</p>
			</div>
		);
	}

	const { totals, users_by_role, parks_by_state, recent_parks } = res.data.data;

	return (
		<div className='space-y-6'>
			<header>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Welcome, {userName}
				</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Platform overview as of {new Date().toLocaleString()}.
				</p>
			</header>

			<KpiRow totals={totals} usersByRole={users_by_role} />

			<section className='grid gap-4 lg:grid-cols-3'>
				<PanelCard
					title='Parkings by state'
					description='Distribution across regions.'
					className='lg:col-span-2'
				>
					<CategoryBarChart data={parks_by_state} />
				</PanelCard>
				<PanelCard
					title='Live occupancy'
					description='Total occupied vs. capacity.'
				>
					<div className='grid h-full place-items-center py-2'>
						<GaugeRing
							value={totals.occupancy_pct}
							label={`${totals.occupied} / ${totals.capacity} spaces`}
						/>
					</div>
				</PanelCard>
			</section>

			<section className='grid gap-4 lg:grid-cols-3'>
				<PanelCard title='Users by role'>
					<CategoryDonutChart data={users_by_role} />
				</PanelCard>

				<PanelCard
					title='Recent parkings'
					description='Latest 5 created.'
					className='lg:col-span-2'
					action={
						<Link
							href='/dashboard/parkings'
							className='text-xs font-medium text-foreground underline-offset-4 hover:underline'
						>
							View all →
						</Link>
					}
				>
					<RecentParksList items={recent_parks} />
				</PanelCard>
			</section>
		</div>
	);
}
