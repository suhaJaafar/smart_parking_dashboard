import Link from 'next/link';

import { DeleteParkButton } from '@/app/dashboard/parkings/delete-park-button';
import {
	OCCUPANCY_BAR_CLASS,
	occupancyPct,
	occupancyTone,
} from '@/app/lib/stats/occupancy';
import type { Park } from '@/app/types/park';

/**
 * Tabular parkings view. The owner column is opt-in so the same component
 * serves both the admin "all parks" page and the space owner's own list.
 */
export function ParksTable({
	parks,
	showOwner,
	canManage,
	startIndex = 1,
}: {
	parks: readonly Park[];
	showOwner: boolean;
	canManage: (park: Park) => boolean;
	startIndex?: number;
}) {
	return (
		<div className='overflow-x-auto rounded-xl border border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950'>
			<table className='w-full text-sm'>
				<thead className='bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60'>
					<tr>
						<th className='w-16 px-4 py-3 font-medium'>No.</th>
						<th className='px-4 py-3 font-medium'>Name</th>
						{showOwner ? (
							<th className='px-4 py-3 font-medium'>Owner</th>
						) : null}
						<th className='px-4 py-3 font-medium'>Location</th>
						<th className='px-4 py-3 text-right font-medium'>Capacity</th>
						<th className='px-4 py-3 text-right font-medium'>Free</th>
						<th className='px-4 py-3 font-medium'>Occupancy</th>
						<th
							className='px-4 py-3 text-right font-medium'
							aria-label='Actions'
						/>
					</tr>
				</thead>
				<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
					{parks.map((park, rowIndex) => (
						<Row
							key={park.id}
							park={park}
							showOwner={showOwner}
							canManage={canManage(park)}
							index={startIndex + rowIndex}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Row({
	park,
	showOwner,
	canManage,
	index,
}: {
	park: Park;
	showOwner: boolean;
	canManage: boolean;
	index: number;
}) {
	const loc = park.location;
	const pct = occupancyPct(park.capacity, park.free_spaces);
	const tone = OCCUPANCY_BAR_CLASS[occupancyTone(pct)];

	return (
		<tr className='hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40'>
			<td className='px-4 py-3 text-sm tabular-nums text-zinc-500 dark:text-zinc-400'>
				{index}
			</td>
			<td className='px-4 py-3'>
				<Link
					href={`/dashboard/parkings/${park.id}`}
					className='font-medium hover:underline'
				>
					{park.name}
				</Link>
			</td>
			{showOwner ? (
				<td className='px-4 py-3'>
					{park.owner ? (
						<div className='leading-tight'>
							<p className='text-sm'>{park.owner.name}</p>
							<p className='text-xs text-zinc-500 dark:text-zinc-400'>
								{park.owner.email}
							</p>
						</div>
					) : (
						<span className='text-xs text-zinc-500'>—</span>
					)}
				</td>
			) : null}
			<td className='px-4 py-3'>
				<p className='text-sm'>
					{loc?.city ?? '—'}
					{loc?.state?.label ? `, ${loc.state.label}` : ''}
				</p>
				<p className='text-xs text-zinc-500 dark:text-zinc-400'>
					{loc?.country?.label ?? ''}
				</p>
			</td>
			<td className='px-4 py-3 text-right tabular-nums'>{park.capacity}</td>
			<td className='px-4 py-3 text-right tabular-nums'>{park.free_spaces}</td>
			<td className='px-4 py-3'>
				<div className='flex items-center gap-2'>
					<div className='h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800'>
						<div
							className={`h-full ${tone}`}
							style={{ width: `${Math.min(100, pct).toFixed(0)}%` }}
						/>
					</div>
					<span className='text-xs tabular-nums text-zinc-500'>
						{pct.toFixed(0)}%
					</span>
				</div>
			</td>
			<td className='px-4 py-3 text-right'>
				<div className='flex items-center justify-end gap-2'>
					<Link
						href={`/dashboard/parkings/${park.id}`}
						className='rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
					>
						View
					</Link>
					{canManage ? (
						<>
							<Link
								href={`/dashboard/parkings/${park.id}/edit`}
								className='rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
							>
								Edit
							</Link>
							<DeleteParkButton id={park.id} name={park.name} />
						</>
					) : null}
				</div>
			</td>
		</tr>
	);
}
