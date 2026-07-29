import { redirect } from 'next/navigation';

import { ExportMenu } from '@/app/components/export-menu';
import { Pagination } from '@/app/components/pagination';
import { CustomersTable } from '@/app/dashboard/customers/customers-table';
import {
	ReservationParkFilter,
	type ReservationParkOption,
} from '@/app/dashboard/reservations/reservation-park-filter';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { listParkUsers } from '@/app/lib/park-users/api';
import { canViewParkUsers } from '@/app/lib/park-users/permissions';
import { listMyParks } from '@/app/lib/parks/api';

interface PageProps {
	searchParams: Promise<{
		page?: string;
		park_id?: string;
	}>;
}

const BASE_PATH = '/dashboard/customers';

/**
 * SPACE_OWNER surface listing every customer who has ever reserved at one of
 * their garages — regardless of how the reservation ended. One row per
 * person with lifetime activity, filterable by garage, exportable to Excel.
 */
export default async function CustomersPage({ searchParams }: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	if (!canViewParkUsers(user)) redirect('/dashboard');

	const { page, park_id: parkId } = await searchParams;
	const pageNumber = Math.max(1, Number(page) || 1);

	const [usersRes, parks] = await Promise.all([
		listParkUsers({ page: pageNumber, parkId }),
		loadParkOptions(),
	]);

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>Customers</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						Everyone who has ever reserved at your garages — including those who
						left, expired, or never entered. Filter by garage and export the
						full list.
					</p>
				</div>
				<ExportMenu
					endpoint='/api/exports/park-users'
					extraParams={{ park_id: parkId }}
				/>
			</div>

			{parks.length > 0 ? (
				<ReservationParkFilter
					parks={parks}
					selected={parkId ?? null}
					basePath={BASE_PATH}
				/>
			) : null}

			{!usersRes.ok ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{usersRes.error?.message ?? 'Failed to load customers.'}
				</p>
			) : (
				<CustomersTable rows={usersRes.data.data} />
			)}

			{usersRes.ok ? (
				<Pagination
					basePath={BASE_PATH}
					current={usersRes.data.meta.current_page}
					last={usersRes.data.meta.last_page}
					params={{ park_id: parkId }}
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
