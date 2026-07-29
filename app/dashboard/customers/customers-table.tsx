import { formatIsoDateTime } from '@/app/lib/reservation-stats/format';
import type { ParkUser } from '@/app/types/park-user';

/**
 * Person-centric table of every customer who has reserved at the owner's
 * garages, with their lifetime activity. Read-only; the reservations list
 * owns any per-reservation actions.
 */
export function CustomersTable({ rows }: { rows: readonly ParkUser[] }) {
	if (rows.length === 0) {
		return (
			<div className='rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800'>
				No customers have reserved at your garages yet.
			</div>
		);
	}

	return (
		<div className='overflow-x-auto rounded-xl border border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950'>
			<table className='w-full text-sm'>
				<thead className='bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-400'>
					<tr>
						<th className='px-4 py-3 font-medium'>Customer</th>
						<th className='px-4 py-3 font-medium'>Plate</th>
						<th className='px-4 py-3 text-right font-medium'>Total</th>
						<th className='px-4 py-3 text-right font-medium'>Completed</th>
						<th className='px-4 py-3 text-right font-medium'>Cancelled</th>
						<th className='px-4 py-3 text-right font-medium'>Expired</th>
						<th className='px-4 py-3 font-medium'>Last activity</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
					{rows.map((r) => (
						<Row key={r.user_id} row={r} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function Row({ row }: { row: ParkUser }) {
	const phone = row.phone_number ?? null;

	return (
		<tr className='hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30'>
			<td className='px-4 py-3'>
				<div className='leading-tight'>
					<p className='text-sm font-medium'>
						{row.name ?? <span className='text-zinc-400'>Unknown</span>}
					</p>
					{phone ? (
						<a
							href={`tel:${phone}`}
							dir='ltr'
							className='text-xs tabular-nums text-zinc-500 hover:underline dark:text-zinc-400'
						>
							{phone}
						</a>
					) : (
						<span className='text-xs text-zinc-400'>No phone</span>
					)}
				</div>
			</td>
			<td className='px-4 py-3'>
				{row.car?.plate ? (
					<span className='font-mono text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-100'>
						{row.car.plate}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
				)}
			</td>
			<td className='px-4 py-3 text-right tabular-nums font-medium'>
				{row.total.toLocaleString()}
			</td>
			<td className='px-4 py-3 text-right tabular-nums text-emerald-700 dark:text-emerald-400'>
				{row.completed.toLocaleString()}
			</td>
			<td className='px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400'>
				{row.cancelled.toLocaleString()}
			</td>
			<td className='px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400'>
				{row.expired.toLocaleString()}
			</td>
			<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
				{formatIsoDateTime(row.last_at)}
			</td>
		</tr>
	);
}
