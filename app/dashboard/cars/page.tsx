import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ExportMenu } from '@/app/components/export-menu';
import { Pagination } from '@/app/components/pagination';
import { CarHistoryTable } from '@/app/dashboard/cars/car-history-table';
import { CarsTable } from '@/app/dashboard/cars/cars-table';
import { ParkFilter, type ParkOption } from '@/app/dashboard/cars/park-filter';
import { WaitingTable } from '@/app/dashboard/cars/waiting-table';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { listOwnerCars, listOwnerParkCarHistory } from '@/app/lib/cars/api';
import { canManageOwnerCars } from '@/app/lib/cars/permissions';
import { listMyParks } from '@/app/lib/parks/api';
import { getPageStartIndex } from '@/app/lib/table-index';

interface PageProps {
	searchParams: Promise<{
		page?: string;
		hpage?: string;
		park_id?: string;
		error?: string;
		ok?: string;
	}>;
}

const BASE_PATH = '/dashboard/cars';

/**
 * SPACE_OWNER surface for the cars physically parked inside their garages.
 *
 * Owners can review every car, filter by garage, add a car that just drove
 * in, edit its plate/model, or remove it (freeing the slot). Lower-privileged
 * users are bounced home; the backend enforces the scope independently.
 */
export default async function CarsPage({ searchParams }: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	if (!canManageOwnerCars(user)) redirect('/dashboard');

	const { page, hpage, park_id: parkId, error, ok } = await searchParams;
	const pageNumber = Math.max(1, Number(page) || 1);
	const historyPage = Math.max(1, Number(hpage) || 1);

	const [carsRes, parks, historyRes] = await Promise.all([
		listOwnerCars({ page: pageNumber, parkId }),
		loadParkOptions(),
		listOwnerParkCarHistory({ page: historyPage, parkId }),
	]);

	const waiting = carsRes.ok ? carsRes.data.waiting : [];

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>Cars</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						Every car currently parked inside your garages. Add a car that just
						entered, edit its details, or remove it when it leaves.
					</p>
				</div>
				<Link
					href='/dashboard/cars/new'
					className='inline-flex h-9 items-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]'
				>
					Add car
				</Link>
			</div>

			{ok === 'deleted' ? (
				<p className='rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'>
					Car removed and its slot freed.
				</p>
			) : null}

			{error ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{errorMessage(error)}
				</p>
			) : null}

			{parks.length > 0 ? (
				<ParkFilter parks={parks} selected={parkId ?? null} />
			) : null}

			{!carsRes.ok ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{carsRes.error?.message ?? 'Failed to load cars.'}
				</p>
			) : carsRes.data.data.length === 0 ? (
				<EmptyState hasParks={parks.length > 0} />
			) : (
				<CarsTable
					cars={carsRes.data.data}
					startIndex={getPageStartIndex(
						carsRes.data.meta.current_page,
						carsRes.data.meta.per_page,
					)}
				/>
			)}

			{carsRes.ok ? (
				<Pagination
					current={carsRes.data.meta.current_page}
					last={carsRes.data.meta.last_page}
					basePath={BASE_PATH}
					params={{ park_id: parkId }}
				/>
			) : null}

			{waiting.length > 0 ? (
				<section className='space-y-3 pt-2'>
					<div>
						<h2 className='flex items-center gap-2 text-lg font-semibold tracking-tight'>
							Waiting to enter
							<span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'>
								{waiting.length}
							</span>
						</h2>
						<p className='text-sm text-zinc-600 dark:text-zinc-400'>
							Cars that reserved a spot from the bot but haven&apos;t driven in
							yet. They don&apos;t take a physical space until they actually
							enter.
						</p>
					</div>
					<WaitingTable holds={waiting} startIndex={1} />
				</section>
			) : null}

			<section className='space-y-3 pt-2'>
				<div className='flex flex-wrap items-start justify-between gap-3'>
					<div>
						<h2 className='flex items-center gap-2 text-lg font-semibold tracking-tight'>
							Entered before
							{historyRes.ok ? (
								<span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-100 px-1.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'>
									{historyRes.data.meta.total}
								</span>
							) : null}
						</h2>
						<p className='text-sm text-zinc-600 dark:text-zinc-400'>
							Every car that has entered this garage and left — the full
							history, with owner, contact and how long they stayed.
						</p>
					</div>
					<ExportMenu
						endpoint='/api/exports/park-cars'
						extraParams={{ park_id: parkId }}
					/>
				</div>

				{!historyRes.ok ? (
					<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
						{historyRes.error?.message ?? 'Failed to load history.'}
					</p>
				) : (
					<CarHistoryTable
						rows={historyRes.data.data}
						startIndex={getPageStartIndex(
							historyRes.data.meta.current_page,
							historyRes.data.meta.per_page,
						)}
					/>
				)}

				{historyRes.ok ? (
					<Pagination
						current={historyRes.data.meta.current_page}
						last={historyRes.data.meta.last_page}
						basePath={BASE_PATH}
						pageParam='hpage'
						params={{ park_id: parkId }}
					/>
				) : null}
			</section>
		</div>
	);
}

async function loadParkOptions(): Promise<ParkOption[]> {
	const res = await listMyParks(1);
	if (!res.ok) return [];
	return res.data.data.map((p) => ({ id: p.id, name: p.name }));
}

function EmptyState({ hasParks }: { hasParks: boolean }) {
	return (
		<div className='rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-950'>
			<p className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
				No cars parked right now
			</p>
			<p className='mx-auto mt-1 max-w-md text-sm text-zinc-500 dark:text-zinc-400'>
				{hasParks
					? 'When a car drives into one of your garages, add it here to keep your occupancy accurate.'
					: 'Create a garage first, then you can start recording the cars parked inside it.'}
			</p>
		</div>
	);
}

function errorMessage(code: string): string {
	switch (code) {
		case 'forbidden':
			return 'You are not allowed to perform that action.';
		case 'not_found':
			return 'That car no longer exists — it may have been removed already.';
		case 'delete_failed':
			return 'Could not remove the car. Please try again.';
		default:
			return 'Something went wrong.';
	}
}
