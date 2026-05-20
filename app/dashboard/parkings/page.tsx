import Link from 'next/link';

import { Pagination } from '@/app/components/pagination';
import { ParksTable } from '@/app/dashboard/parkings/parks-table';
import { actionErrorMessage } from '@/app/lib/action-errors';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { listMyParks, listParks } from '@/app/lib/parks/api';
import {
	canCreatePark,
	canManagePark,
	canViewAllParks,
} from '@/app/lib/parks/permissions';

interface PageProps {
	searchParams: Promise<{ page?: string; error?: string }>;
}

export default async function ParkingsPage({ searchParams }: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	const { page, error } = await searchParams;
	const pageNumber = Math.max(1, Number(page) || 1);

	const showAll = canViewAllParks(user);
	const res = showAll
		? await listParks(pageNumber)
		: await listMyParks(pageNumber);

	return (
		<div className='space-y-6'>
			<div className='flex items-end justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>
						{showAll ? 'All parkings' : 'Your parkings'}
					</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						{showAll
							? 'Every parking on the platform — manage any record.'
							: 'Parkings owned by your account.'}
					</p>
				</div>
				{canCreatePark(user) ? (
					<Link
						href='/dashboard/parkings/new'
						className='inline-flex h-9 items-center rounded-md bg-foreground px-3 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]'
					>
						New parking
					</Link>
				) : null}
			</div>

			{error ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{actionErrorMessage(error, 'parking')}
				</p>
			) : null}

			{!res.ok ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{res.error?.message ?? 'Failed to load parkings.'}
				</p>
			) : res.data.data.length === 0 ? (
				<p className='rounded-md border border-zinc-200 bg-white px-3 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'>
					No parkings yet.
				</p>
			) : (
				<ParksTable
					parks={res.data.data}
					showOwner={showAll}
					canManage={(park) => canManagePark(user, park)}
				/>
			)}

			{res.ok ? (
				<Pagination
					current={res.data.meta.current_page}
					last={res.data.meta.last_page}
					basePath='/dashboard/parkings'
				/>
			) : null}
		</div>
	);
}
