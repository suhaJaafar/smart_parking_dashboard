import Link from 'next/link';

import { DeleteCarButton } from '@/app/dashboard/cars/delete-car-button';
import type { OwnerCar } from '@/app/types/car';

/**
 * Tabular view of the cars currently inside the owner's garages. Each row
 * surfaces the plate, model, which garage the car sits in, the customer
 * contact, and edit / remove controls.
 */
export function CarsTable({
	cars,
	startIndex = 1,
}: {
	cars: readonly OwnerCar[];
	startIndex?: number;
}) {
	return (
		<div className='overflow-x-auto rounded-xl border border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950'>
			<table className='w-full text-sm'>
				<thead className='bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60'>
					<tr>
						<th className='w-16 px-4 py-3 font-medium'>No.</th>
						<th className='px-4 py-3 font-medium'>Plate</th>
						<th className='px-4 py-3 font-medium'>Model</th>
						<th className='px-4 py-3 font-medium'>Garage</th>
						<th className='px-4 py-3 font-medium'>Customer</th>
						<th
							className='px-4 py-3 text-right font-medium'
							aria-label='Actions'
						/>
					</tr>
				</thead>
				<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
					{cars.map((car, rowIndex) => (
						<Row key={car.id} car={car} index={startIndex + rowIndex} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function Row({ car, index }: { car: OwnerCar; index: number }) {
	const phone = car.customer?.phone_number ?? null;

	return (
		<tr className='hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40'>
			<td className='px-4 py-3 text-sm tabular-nums text-zinc-500 dark:text-zinc-400'>
				{index}
			</td>
			<td className='px-4 py-3'>
				<span className='font-mono text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-100'>
					{car.plate || '—'}
				</span>
			</td>
			<td className='px-4 py-3 text-zinc-700 dark:text-zinc-300'>
				{car.model || <span className='text-zinc-400'>—</span>}
			</td>
			<td className='px-4 py-3'>
				{car.park?.name ? (
					<span className='inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
						{car.park.name}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
				)}
			</td>
			<td className='px-4 py-3'>
				<div className='leading-tight'>
					<p className='text-sm'>
						{car.customer?.name ?? <span className='text-zinc-400'>—</span>}
					</p>
					{phone ? (
						<a
							href={`tel:${phone}`}
							dir='ltr'
							className='text-xs tabular-nums text-zinc-500 hover:underline dark:text-zinc-400'
						>
							{phone}
						</a>
					) : null}
				</div>
			</td>
			<td className='px-4 py-3'>
				<div className='flex items-center justify-end gap-2'>
					<Link
						href={`/dashboard/cars/${car.id}/edit`}
						className='rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
					>
						Edit
					</Link>
					<DeleteCarButton id={car.id} plate={car.plate} />
				</div>
			</td>
		</tr>
	);
}
