import { redirect } from 'next/navigation';

import { ExportMenu } from '@/app/components/export-menu';
import { Pagination } from '@/app/components/pagination';
import { ReservationFilterTabs } from '@/app/dashboard/reservations/reservation-filter-tabs';
import {
	ReservationParkFilter,
	type ReservationParkOption,
} from '@/app/dashboard/reservations/reservation-park-filter';
import { ReservationsTable } from '@/app/dashboard/reservations/reservations-table';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { listMyParks } from '@/app/lib/parks/api';
import { listOwnerReservations } from '@/app/lib/reservations/api';
import { canManageOwnerReservations } from '@/app/lib/reservations/permissions';
import { canViewAnyReservationStats } from '@/app/lib/reservation-stats/permissions';
import Link from 'next/link';
import type { ReservationFilter } from '@/app/types/reservation';

interface PageProps {
	searchParams: Promise<{
		page?: string;
		park_id?: string;
		filter?: string;
		error?: string;
		ok?: string;
	}>;
}

const BASE_PATH = '/dashboard/reservations';

const VALID_FILTERS: readonly ReservationFilter[] = [
	'live',
	'waiting',
	'active',
	'history',
	'all',
];

/**
 * SPACE_OWNER surface for reservations targeting their garages.
 *
 * Every reservation is scoped by the backend to the owner's `ownedParks()`;
 * this page just lets the owner slice that dataset (by garage and lifecycle
 * bucket) and invoke the two allowed transitions — cancel a waiting hold or
 * exit an active car — which are wired to the same services the bot calls.
 * Deleting a reservation is intentionally NOT exposed.
 */
export default async function ReservationsPage({ searchParams }: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	if (!canManageOwnerReservations(user)) redirect('/dashboard');

	const {
		page,
		park_id: parkId,
		filter: rawFilter,
		error,
		ok,
	} = await searchParams;

	const pageNumber = Math.max(1, Number(page) || 1);
	const filter: ReservationFilter = VALID_FILTERS.includes(
		rawFilter as ReservationFilter,
	)
		? (rawFilter as ReservationFilter)
		: 'all';

	const [reservationsRes, parks] = await Promise.all([
		listOwnerReservations({ page: pageNumber, parkId, filter }),
		loadParkOptions(),
	]);

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>
						Reservations
					</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						Every reservation across your garages. Cancel a waiting hold or
						drive an active car out — actions run through the same services the
						bot uses.
					</p>
				</div>
				{canViewAnyReservationStats(user) ? (
					<div className='flex items-center gap-2'>
						<ExportMenu
							endpoint='/api/exports/reservations'
							extraParams={{
								park_id: parkId,
								filter: filter !== 'all' ? filter : undefined,
							}}
						/>
						<Link
							href='/dashboard/reservations/stats'
							className='inline-flex h-9 items-center rounded-md border border-zinc-300 px-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
						>
							View analytics
						</Link>
					</div>
				) : (
					<ExportMenu
						endpoint='/api/exports/reservations'
						extraParams={{
							park_id: parkId,
							filter: filter !== 'all' ? filter : undefined,
						}}
					/>
				)}
			</div>

			{ok ? (
				<p className='rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'>
					{successMessage(ok)}
				</p>
			) : null}

			{error ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{errorMessage(error)}
				</p>
			) : null}

			<div className='flex flex-wrap items-center justify-between gap-3'>
				<ReservationFilterTabs selected={filter} />
				{parks.length > 0 ? (
					<ReservationParkFilter parks={parks} selected={parkId ?? null} />
				) : null}
			</div>

			{!reservationsRes.ok ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{reservationsRes.error?.message ?? 'Failed to load reservations.'}
				</p>
			) : reservationsRes.data.data.length === 0 ? (
				<EmptyState filter={filter} />
			) : (
				<ReservationsTable
					reservations={reservationsRes.data.data}
					redirectTo={buildRedirectTo(pageNumber, parkId, filter)}
				/>
			)}

			{reservationsRes.ok ? (
				<Pagination
					basePath={BASE_PATH}
					current={reservationsRes.data.meta.current_page}
					last={reservationsRes.data.meta.last_page}
					params={{
						park_id: parkId,
						filter: filter !== 'all' ? filter : undefined,
					}}
				/>
			) : null}
		</div>
	);
}

async function loadParkOptions(): Promise<readonly ReservationParkOption[]> {
	const res = await listMyParks(1);
	if (!res.ok) return [];
	return res.data.data.map((p) => ({ id: p.id, name: p.name }));
}

function EmptyState({ filter }: { filter: ReservationFilter }) {
	const copy: Record<ReservationFilter, string> = {
		live: 'No live reservations right now.',
		waiting: 'No customers are currently waiting to enter.',
		active: 'No cars are currently parked with an active reservation.',
		history: 'No completed, expired, or cancelled reservations yet.',
		all: 'No reservations yet across your garages.',
	};
	return (
		<div className='rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500 dark:border-zinc-800'>
			{copy[filter]}
		</div>
	);
}

function successMessage(code: string): string {
	switch (code) {
		case 'cancelled':
			return 'Reservation cancelled. The customer has been notified.';
		case 'exited':
			return 'Car exited and slot freed. Reservation marked completed.';
		default:
			return 'Done.';
	}
}

function errorMessage(code: string): string {
	switch (code) {
		case 'forbidden':
			return 'You are not allowed to perform that action.';
		case 'not_found':
			return 'That reservation was not found in one of your garages.';
		case 'invalid_state':
			return 'The reservation is no longer in a state where that action is allowed.';
		case 'cancel_failed':
			return 'Failed to cancel the reservation.';
		case 'exit_failed':
			return 'Failed to exit the car.';
		default:
			return 'Something went wrong.';
	}
}

function buildRedirectTo(
	page: number,
	parkId: string | undefined,
	filter: ReservationFilter,
): string {
	const params = new URLSearchParams();
	if (page > 1) params.set('page', String(page));
	if (parkId) params.set('park_id', parkId);
	if (filter !== 'all') params.set('filter', filter);
	const qs = params.toString();
	return qs ? `${BASE_PATH}?${qs}` : BASE_PATH;
}
