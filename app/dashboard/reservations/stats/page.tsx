import Link from 'next/link';
import { redirect } from 'next/navigation';

import { PanelCard, StatCard } from '@/app/components/stats/stat-card';
import {
	DurationHistogramChart,
	PeakHourChart,
	ReservationsByDayChart,
	StatusDonutChart,
	TopParksChart,
} from '@/app/dashboard/reservations/stats/reservation-stats-charts';
import { ReservationsDetailTable } from '@/app/dashboard/reservations/stats/reservations-detail-table';
import {
	StatsFilters,
	type StatsParkOption,
} from '@/app/dashboard/reservations/stats/stats-filters';
import { TopParksList } from '@/app/dashboard/reservations/stats/top-parks-list';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { listParks } from '@/app/lib/parks/api';
import { listMyParks } from '@/app/lib/parks/api';
import {
	getAdminReservationStats,
	getOwnerReservationStats,
} from '@/app/lib/reservation-stats/api';
import {
	formatDurationMinutes,
	formatIsoDate,
	toIsoDateInput,
} from '@/app/lib/reservation-stats/format';
import {
	canViewAdminReservationStats,
	canViewAnyReservationStats,
	canViewOwnerReservationStats,
	defaultReservationStatsScope,
} from '@/app/lib/reservation-stats/permissions';
import { canManageOwnerReservations } from '@/app/lib/reservations/permissions';
import type { ApiResult } from '@/app/types/api';
import type {
	ReservationStats,
	ReservationStatsFilter,
	ReservationStatsScope,
} from '@/app/types/reservation-stats';

interface PageProps {
	searchParams: Promise<{
		from?: string;
		to?: string;
		park_id?: string;
		scope?: string;
	}>;
}

/**
 * Reservations analytics.
 *
 * - SPACE_OWNER sees THEIR own parks.
 * - ADMIN / SUPER_ADMIN sees EVERY park.
 * - A viewer holding both roles gets a scope toggle (default: All parks).
 *
 * Every metric is server-side rendered — Recharts is only used inside the
 * client-boundary chart components imported from the sibling file.
 */
export default async function ReservationStatsPage({
	searchParams,
}: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;

	if (!canViewAnyReservationStats(user)) {
		redirect('/dashboard');
	}

	const { from, to, park_id: parkId, scope: rawScope } = await searchParams;

	const scope = resolveScope(rawScope, user);
	if (!scope) redirect('/dashboard');

	const filter: ReservationStatsFilter = {};
	if (from) filter.from = from;
	if (to) filter.to = to;
	if (parkId) filter.park_id = parkId;

	const [statsRes, parks] = await Promise.all([
		fetchStats(scope, filter),
		loadParkOptions(scope, user),
	]);

	const canToggleScope =
		canViewAdminReservationStats(user) && canViewOwnerReservationStats(user);

	return (
		<div className='space-y-6'>
			<header className='flex flex-wrap items-start justify-between gap-3'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>
						Reservations analytics
					</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						{scope === 'admin'
							? 'Platform-wide activity across every garage.'
							: 'Activity across the garages you own.'}
					</p>
				</div>
				{canManageOwnerReservations(user) ? (
					<Link
						href='/dashboard/reservations'
						className='inline-flex h-9 items-center rounded-md border border-zinc-300 px-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
					>
						Back to reservations
					</Link>
				) : null}
			</header>

			<StatsFilters
				from={filterToInputDate(from, statsRes)}
				to={filterToInputDate(to, statsRes, true)}
				parkId={parkId ?? null}
				parks={parks}
				scope={scope}
				canToggleScope={canToggleScope}
			/>

			{!statsRes.ok ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{statsRes.error?.message ?? 'Failed to load reservations analytics.'}
				</p>
			) : (
				<StatsBody
					stats={statsRes.data.data}
					canOpenList={canManageOwnerReservations(user)}
				/>
			)}
		</div>
	);
}

/* -------------------------------------------------------------------------- */

function StatsBody({
	stats,
	canOpenList,
}: {
	stats: ReservationStats;
	canOpenList: boolean;
}) {
	const {
		range,
		totals,
		by_status,
		by_day,
		by_hour,
		by_park,
		duration_buckets,
		recent,
	} = stats;

	return (
		<>
			<p className='text-xs text-zinc-500 dark:text-zinc-400'>
				Showing <strong>{formatIsoDate(range.from)}</strong> →{' '}
				<strong>{formatIsoDate(range.to)}</strong>
			</p>

			<section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<StatCard
					label='Total reservations'
					value={totals.total_reservations.toLocaleString()}
					hint={`${totals.unique_customers.toLocaleString()} unique customers`}
				/>
				<StatCard
					label='Avg. stay duration'
					value={formatDurationMinutes(totals.avg_duration_minutes)}
					hint={`Total: ${formatDurationMinutes(totals.total_duration_minutes)}`}
				/>
				<StatCard
					label='Completion rate'
					value={`${totals.completion_rate.toFixed(1)}%`}
					hint={`${totals.completed.toLocaleString()} completed`}
					tone={
						totals.completion_rate >= 70
							? 'positive'
							: totals.completion_rate >= 40
								? 'warning'
								: 'danger'
					}
				/>
				<StatCard
					label='Cancellation rate'
					value={`${totals.cancellation_rate.toFixed(1)}%`}
					hint={`${totals.cancelled.toLocaleString()} cancelled · ${totals.expired.toLocaleString()} expired`}
					tone={
						totals.cancellation_rate >= 25
							? 'danger'
							: totals.cancellation_rate >= 10
								? 'warning'
								: 'positive'
					}
				/>
			</section>

			<section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				<StatCard label='Waiting' value={totals.waiting.toLocaleString()} />
				<StatCard
					label='Active'
					value={totals.active.toLocaleString()}
					tone='positive'
				/>
				<StatCard
					label='Pre-bookings'
					value={totals.pre_booking.toLocaleString()}
				/>
				<StatCard
					label='On-site holds'
					value={totals.on_site.toLocaleString()}
				/>
			</section>

			<section className='grid gap-4 lg:grid-cols-3'>
				<PanelCard
					title='Reservations over time'
					description='Daily volume with completed stays overlaid.'
					className='lg:col-span-2'
				>
					<ReservationsByDayChart data={by_day} />
				</PanelCard>
				<PanelCard
					title='Status breakdown'
					description='Share of reservations in each lifecycle stage.'
				>
					<StatusDonutChart data={by_status} />
				</PanelCard>
			</section>

			<section className='grid gap-4 lg:grid-cols-2'>
				<PanelCard
					title='Peak hours'
					description='When reservations start (by created-at hour, local time).'
				>
					<PeakHourChart data={by_hour} />
				</PanelCard>
				<PanelCard
					title='Stay duration'
					description='Distribution of completed stays. Duration = booking → exit.'
				>
					<DurationHistogramChart data={duration_buckets} />
				</PanelCard>
			</section>

			<section className='grid gap-4 lg:grid-cols-3'>
				<PanelCard
					title='Top parks'
					description='Ranked by reservation volume in this window.'
					className='lg:col-span-2'
				>
					<TopParksChart data={by_park} />
				</PanelCard>
				<PanelCard
					title='Park leaderboard'
					description='With average completed-stay duration.'
				>
					<TopParksList parks={by_park} />
				</PanelCard>
			</section>

			<section>
				<PanelCard
					title='Recent reservations'
					description='Most recent activity, including origin, exit and total duration.'
					action={
						canOpenList ? (
							<Link
								href='/dashboard/reservations?filter=all'
								className='text-xs font-medium text-foreground underline-offset-4 hover:underline'
							>
								Open list →
							</Link>
						) : null
					}
				>
					<ReservationsDetailTable rows={recent} />
				</PanelCard>
			</section>
		</>
	);
}

/* -------------------------------------------------------------------------- */
/*  helpers                                                                   */
/* -------------------------------------------------------------------------- */

function resolveScope(
	raw: string | undefined,
	user: Parameters<typeof canViewAdminReservationStats>[0],
): ReservationStatsScope | null {
	if (raw === 'owner' && canViewOwnerReservationStats(user)) return 'owner';
	if (raw === 'admin' && canViewAdminReservationStats(user)) return 'admin';
	return defaultReservationStatsScope(user);
}

function fetchStats(
	scope: ReservationStatsScope,
	filter: ReservationStatsFilter,
): Promise<ApiResult<{ data: ReservationStats }>> {
	return scope === 'admin'
		? getAdminReservationStats(filter)
		: getOwnerReservationStats(filter);
}

/**
 * Load the parks the current user is allowed to filter by. Admins see every
 * park on the platform (paginated to the first page — the filter is a
 * convenience, not a comprehensive picker); owners see their own portfolio.
 */
async function loadParkOptions(
	scope: ReservationStatsScope,
	user: Parameters<typeof canViewAdminReservationStats>[0],
): Promise<StatsParkOption[]> {
	const res =
		scope === 'admin' && canViewAdminReservationStats(user)
			? await listParks(1)
			: await listMyParks(1);
	if (!res.ok) return [];
	return res.data.data.map((p) => ({ id: p.id, name: p.name }));
}

/**
 * Turn either the URL param or the server-resolved range into the value
 * expected by `<input type='date'>`. Falls back to the range the backend
 * normalized (`stats.range`), so the filter always reflects what was
 * actually queried — no stale mismatch between the form and the chart.
 */
function filterToInputDate(
	raw: string | undefined,
	statsRes: ApiResult<{ data: ReservationStats }>,
	isTo = false,
): string {
	if (raw) return raw;
	if (!statsRes.ok) return '';
	return toIsoDateInput(
		isTo ? statsRes.data.data.range.to : statsRes.data.data.range.from,
	);
}
