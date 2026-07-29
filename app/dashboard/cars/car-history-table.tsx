import {
	formatDurationMinutes,
	formatIsoDateTime,
} from '@/app/lib/reservation-stats/format';
import type { ParkCarHistory } from '@/app/types/car';

/**
 * Audit-trail table of cars that entered a garage in the past and have since
 * left. Read-only — it complements the live "currently parked" list with the
 * full history (plate, owner, contact, model, entry/exit, duration).
 */
export function CarHistoryTable({ rows }: { rows: readonly ParkCarHistory[] }) {
	if (rows.length === 0) {
		return (
			<div className='rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800'>
				No cars have completed a stay in this garage yet.
			</div>
		);
	}

	return (
		<div className='overflow-x-auto rounded-xl border border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950'>
			<table className='w-full text-sm'>
				<thead className='bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-400'>
					<tr>
						<th className='px-4 py-3 font-medium'>Code</th>
						<th className='px-4 py-3 font-medium'>Plate</th>
						<th className='px-4 py-3 font-medium'>Model</th>
						<th className='px-4 py-3 font-medium'>Owner</th>
						<th className='px-4 py-3 font-medium'>Garage</th>
						<th className='px-4 py-3 font-medium'>Entered</th>
						<th className='px-4 py-3 font-medium'>Exited</th>
						<th className='px-4 py-3 text-right font-medium'>Duration</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
					{rows.map((r) => (
						<Row key={r.id} row={r} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function Row({ row }: { row: ParkCarHistory }) {
	const phone = row.customer?.phone_number ?? null;

	return (
		<tr className='hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30'>
			<td className='px-4 py-3'>
				{row.booking_code ? (
					<span className='inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 font-mono text-xs font-bold tracking-widest text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
						{row.booking_code}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
				)}
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
			<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
				{row.car?.model ? (
					row.car.model
				) : (
					<span className='text-zinc-400'>—</span>
				)}
			</td>
			<td className='px-4 py-3'>
				<div className='leading-tight'>
					<p className='text-sm'>
						{row.customer?.name ?? <span className='text-zinc-400'>—</span>}
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
				{row.park?.name ? (
					<span className='inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
						{row.park.name}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
				)}
			</td>
			<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
				{formatIsoDateTime(row.entered_at)}
			</td>
			<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
				{formatIsoDateTime(row.exited_at)}
			</td>
			<td className='px-4 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-100'>
				{formatDurationMinutes(row.duration_minutes)}
			</td>
		</tr>
	);
}
