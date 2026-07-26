import type { OwnerHold } from '@/app/types/car';

/**
 * Tabular view of the cars that have reserved a slot but haven't physically
 * driven into the garage yet. These holds do NOT occupy a real space —
 * `free_spaces` only drops when the car actually enters — so this list simply
 * lets the owner see who is on the way.
 */
export function WaitingTable({ holds }: { holds: readonly OwnerHold[] }) {
	return (
		<div className='overflow-x-auto rounded-xl border border-amber-200/70 bg-white dark:border-amber-900/40 dark:bg-zinc-950'>
			<table className='w-full text-sm'>
				<thead className='bg-amber-50 text-left text-xs uppercase tracking-wide text-amber-700 dark:bg-amber-950/30 dark:text-amber-300/80'>
					<tr>
						<th className='px-4 py-3 font-medium'>Code</th>
						<th className='px-4 py-3 font-medium'>Plate</th>
						<th className='px-4 py-3 font-medium'>Garage</th>
						<th className='px-4 py-3 font-medium'>Customer</th>
						<th className='px-4 py-3 font-medium'>Type</th>
						<th className='px-4 py-3 font-medium'>Reserved</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
					{holds.map((hold) => (
						<Row key={hold.id} hold={hold} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function Row({ hold }: { hold: OwnerHold }) {
	const phone = hold.customer?.phone_number ?? null;

	return (
		<tr className='hover:bg-amber-50/40 dark:hover:bg-amber-950/10'>
			<td className='px-4 py-3'>
				{hold.booking_code ? (
					<span className='inline-flex items-center rounded-md bg-amber-100 px-2 py-1 font-mono text-sm font-bold tracking-widest text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'>
						{hold.booking_code}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
				)}
			</td>
			<td className='px-4 py-3'>
				{hold.car?.plate ? (
					<span className='font-mono text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-100'>
						{hold.car.plate}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>Not provided yet</span>
				)}
			</td>
			<td className='px-4 py-3'>
				{hold.park?.name ? (
					<span className='inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
						{hold.park.name}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
				)}
			</td>
			<td className='px-4 py-3'>
				<div className='leading-tight'>
					<p className='text-sm'>
						{hold.customer?.name ?? <span className='text-zinc-400'>—</span>}
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
				<span className='inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'>
					{hold.is_pre_booking ? 'Pre-booking' : 'On-site hold'}
				</span>
			</td>
			<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
				{formatWhen(hold.reserved_at)}
			</td>
		</tr>
	);
}

function formatWhen(iso: string | null): string {
	if (!iso) return '—';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '—';
	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}
