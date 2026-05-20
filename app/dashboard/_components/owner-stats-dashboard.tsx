import Link from 'next/link';

import { CategoryBarChart, GaugeRing } from '@/app/components/stats/charts';
import { PanelCard, StatCard } from '@/app/components/stats/stat-card';
import { getOwnerStats } from '@/app/lib/owner/api';
import {
	OCCUPANCY_BAR_CLASS,
	occupancyPct,
	occupancyTone,
} from '@/app/lib/stats/occupancy';
import type { OwnerParkRow } from '@/app/types/stats';

/**
 * Server component: fetches per-owner portfolio stats and renders the
 * space-owner home. Failure is shown inline so the layout stays usable.
 */
export async function OwnerStatsDashboard({ userName }: { userName: string }) {
	const res = await getOwnerStats();

	if (!res.ok) {
		return (
			<div className='space-y-2'>
				<h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{res.error?.message ?? 'Failed to load your statistics.'}
				</p>
			</div>
		);
	}

	const { totals, parks, parks_by_state } = res.data.data;
	const occTone = occupancyTone(totals.occupancy_pct);

	return (
		<div className='space-y-6'>
			<header className='flex flex-wrap items-end justify-between gap-3'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>
						Welcome, {userName}
					</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						Snapshot of your parkings as of {new Date().toLocaleString()}.
					</p>
				</div>
				<Link
					href='/dashboard/parkings/new'
					className='inline-flex h-9 items-center rounded-md bg-foreground px-3 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]'
				>
					New parking
				</Link>
			</header>

			<section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<StatCard
					label='Your parkings'
					value={totals.parks.toLocaleString()}
					hint={`${totals.capacity.toLocaleString()} total spaces`}
				/>
				<StatCard
					label='Occupied spaces'
					value={totals.occupied.toLocaleString()}
					hint={`${totals.free_spaces.toLocaleString()} free`}
					tone={occTone}
				/>
				<StatCard
					label='Active customers'
					value={totals.active_customers.toLocaleString()}
					hint='Cars currently parked'
				/>
				<StatCard
					label='All-time customers'
					value={totals.total_customers.toLocaleString()}
					hint={`${totals.active_reserves.toLocaleString()} active reservations`}
				/>
			</section>

			<section className='grid gap-4 lg:grid-cols-3'>
				<PanelCard
					title='Your parkings'
					description='Capacity and live free spaces.'
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
					<OwnerParksList items={parks} />
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

			{parks_by_state.length > 1 ? (
				<section>
					<PanelCard
						title='Parkings by state'
						description='Distribution of your parkings across regions.'
					>
						<CategoryBarChart data={parks_by_state} />
					</PanelCard>
				</section>
			) : null}
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function OwnerParksList({ items }: { items: readonly OwnerParkRow[] }) {
	if (items.length === 0) {
		return (
			<p className='text-sm text-zinc-500 dark:text-zinc-400'>
				You haven’t created any parkings yet.
			</p>
		);
	}

	return (
		<ul className='divide-y divide-zinc-100 dark:divide-zinc-800'>
			{items.map((p) => {
				const pct = occupancyPct(p.capacity, p.free_spaces);
				const tone = OCCUPANCY_BAR_CLASS[occupancyTone(pct)];
				const subtitle = [p.city, p.state].filter(Boolean).join(' · ');

				return (
					<li
						key={p.id}
						className='flex items-center justify-between gap-4 py-2.5'
					>
						<div className='min-w-0'>
							<Link
								href={`/dashboard/parkings/${p.id}`}
								className='block truncate text-sm font-medium hover:underline'
							>
								{p.name}
							</Link>
							{subtitle ? (
								<p className='truncate text-xs text-zinc-500 dark:text-zinc-400'>
									{subtitle}
								</p>
							) : null}
						</div>
						<div className='flex shrink-0 items-center gap-3'>
							<div className='hidden h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 sm:block dark:bg-zinc-800'>
								<div
									className={`h-full ${tone}`}
									style={{ width: `${Math.min(100, pct).toFixed(0)}%` }}
								/>
							</div>
							<div className='text-right text-xs'>
								<p className='font-medium tabular-nums'>
									{p.free_spaces} / {p.capacity}
								</p>
								<p className='text-zinc-500'>free</p>
							</div>
						</div>
					</li>
				);
			})}
		</ul>
	);
}
