import Link from 'next/link';

import type { RecentPark } from '@/app/types/stats';

/** Compact list of the most recently created parkings. */
export function RecentParksList({ items }: { items: readonly RecentPark[] }) {
	if (items.length === 0) {
		return (
			<p className='text-sm text-zinc-500 dark:text-zinc-400'>
				No parkings have been created yet.
			</p>
		);
	}

	return (
		<ul className='divide-y divide-zinc-100 dark:divide-zinc-800'>
			{items.map((p) => (
				<RecentParkItem key={p.id} park={p} />
			))}
		</ul>
	);
}

function RecentParkItem({ park }: { park: RecentPark }) {
	const subtitle = [park.owner?.name ?? 'Unknown owner', park.city, park.state]
		.filter(Boolean)
		.join(' · ');

	return (
		<li className='flex items-center justify-between py-2.5'>
			<div className='min-w-0'>
				<Link
					href={`/dashboard/parkings/${park.id}`}
					className='block truncate text-sm font-medium hover:underline'
				>
					{park.name}
				</Link>
				<p className='truncate text-xs text-zinc-500 dark:text-zinc-400'>
					{subtitle}
				</p>
			</div>
			<div className='shrink-0 text-right text-xs'>
				<p className='font-medium tabular-nums'>
					{park.free_spaces} / {park.capacity}
				</p>
				<p className='text-zinc-500'>free</p>
			</div>
		</li>
	);
}
