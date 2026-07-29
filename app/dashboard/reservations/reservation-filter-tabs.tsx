'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import type { ReservationFilter } from '@/app/types/reservation';

interface Option {
	value: ReservationFilter;
	label: string;
	description: string;
}

const OPTIONS: readonly Option[] = [
	{
		value: 'live',
		label: 'Live',
		description: 'Waiting holds and active cars',
	},
	{ value: 'waiting', label: 'Waiting', description: 'Holds only' },
	{ value: 'active', label: 'Active', description: 'Cars inside the garage' },
	{
		value: 'history',
		label: 'History',
		description: 'Completed, expired, cancelled',
	},
	{ value: 'all', label: 'All', description: 'Every status' },
];

/**
 * Segmented tabs for the reservations list. Navigating updates the `?filter=`
 * query (and resets to page 1) so the server component re-fetches the scoped
 * list.
 */
export function ReservationFilterTabs({
	selected,
	basePath = '/dashboard/reservations',
}: {
	selected: ReservationFilter;
	basePath?: string;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	function navigate(next: ReservationFilter) {
		const params = new URLSearchParams(searchParams.toString());
		if (next === 'all') params.delete('filter');
		else params.set('filter', next);
		params.delete('page');
		const qs = params.toString();
		router.push(qs ? `${basePath}?${qs}` : basePath);
	}

	return (
		<div
			role='tablist'
			aria-label='Reservation status filter'
			className='inline-flex flex-wrap gap-1 rounded-lg border border-zinc-200 bg-white p-1 text-sm dark:border-zinc-800 dark:bg-zinc-950'
		>
			{OPTIONS.map((opt) => {
				const active = opt.value === selected;
				return (
					<button
						key={opt.value}
						type='button'
						role='tab'
						aria-selected={active}
						title={opt.description}
						onClick={() => navigate(opt.value)}
						className={
							active
								? 'rounded-md bg-amber-100 px-3 py-1 font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
								: 'rounded-md px-3 py-1 text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
						}
					>
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}
