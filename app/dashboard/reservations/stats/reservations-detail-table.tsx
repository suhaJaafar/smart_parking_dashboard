import {
	formatDurationMinutes,
	formatIsoDateTime,
} from '@/app/lib/reservation-stats/format';
import type { ReservationStatusLabel } from '@/app/types/reservation';
import type { ReservationDetailRow } from '@/app/types/reservation-stats';

/**
 * Detail table for the analytics page: the last 20 reservations in the
 * selected window, showing where they started, where they ended and how
 * long the car actually stayed.
 *
 * Read-only — the dedicated `/dashboard/reservations` page owns row-level
 * actions (cancel / exit). We link back to that surface so an operator can
 * take action if needed without losing the analytics context.
 */
export function ReservationsDetailTable({
	rows,
}: {
	rows: readonly ReservationDetailRow[];
}) {
	if (rows.length === 0) {
		return (
			<div className='rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800'>
				No reservations in this range yet.
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
						<th className='px-4 py-3 font-medium'>Garage</th>
						<th className='px-4 py-3 font-medium'>Customer</th>
						<th className='px-4 py-3 font-medium'>Status</th>
						<th className='px-4 py-3 font-medium'>From</th>
						<th className='px-4 py-3 font-medium'>To</th>
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

function Row({ row }: { row: ReservationDetailRow }) {
	const phone = row.customer?.phone_number ?? null;

	return (
		<tr className='hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30'>
			<td className='px-4 py-3'>
				{row.booking_code ? (
					<span className='inline-flex items-center rounded-md bg-amber-100 px-2 py-1 font-mono text-sm font-bold tracking-widest text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'>
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
			<td className='px-4 py-3'>
				{row.park?.name ? (
					<span className='inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
						{row.park.name}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
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
				<StatusBadge label={row.status_label} />
				{row.is_pre_booking ? (
					<span className='ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'>
						Pre-booking
					</span>
				) : null}
			</td>
			<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
				{formatIsoDateTime(row.from_iso)}
			</td>
			<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
				{formatIsoDateTime(row.to_iso)}
			</td>
			<td className='px-4 py-3 text-right tabular-nums text-zinc-900 dark:text-zinc-100'>
				{formatDurationMinutes(row.duration_minutes)}
			</td>
		</tr>
	);
}

const STATUS_STYLES: Record<
	ReservationStatusLabel,
	{ label: string; className: string }
> = {
	waiting: {
		label: 'Waiting',
		className:
			'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
	},
	lapsed: {
		label: 'Lapsed',
		className:
			'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
	},
	active: {
		label: 'Active',
		className:
			'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
	},
	completed: {
		label: 'Completed',
		className:
			'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
	},
	expired: {
		label: 'Expired',
		className: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
	},
	cancelled: {
		label: 'Cancelled',
		className: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
	},
	unknown: {
		label: 'Unknown',
		className: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400',
	},
};

function StatusBadge({ label }: { label: ReservationStatusLabel }) {
	const style = STATUS_STYLES[label] ?? STATUS_STYLES.unknown;
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${style.className}`}
		>
			{style.label}
		</span>
	);
}
