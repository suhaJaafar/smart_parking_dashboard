import { ReservationActionButton } from '@/app/dashboard/reservations/reservation-action-button';
import type {
	OwnerReservation,
	ReservationStatusLabel,
} from '@/app/types/reservation';

/**
 * Server component: tabular view of the owner's reservations across every
 * lifecycle stage. The action column exposes only the transitions the
 * backend allows — cancel while waiting, exit-car while active — mirroring
 * the bot behaviour exactly. Rows are never deletable, only status-changed.
 */
export function ReservationsTable({
	reservations,
	redirectTo,
}: {
	reservations: readonly OwnerReservation[];
	redirectTo?: string;
}) {
	return (
		<div className='overflow-x-auto rounded-xl border border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950'>
			<table className='w-full text-sm'>
				<thead className='bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-400'>
					<tr>
						<th className='px-4 py-3 font-medium'>Code</th>
						<th className='px-4 py-3 font-medium'>Plate</th>
						<th className='px-4 py-3 font-medium'>Garage</th>
						<th className='px-4 py-3 font-medium'>Customer</th>
						<th className='px-4 py-3 font-medium'>Type</th>
						<th className='px-4 py-3 font-medium'>Status</th>
						<th className='px-4 py-3 font-medium'>When</th>
						<th className='px-4 py-3 text-right font-medium'>Actions</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
					{reservations.map((r) => (
						<Row key={r.id} reservation={r} redirectTo={redirectTo} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function Row({
	reservation,
	redirectTo,
}: {
	reservation: OwnerReservation;
	redirectTo?: string;
}) {
	const phone = reservation.customer?.phone_number ?? null;
	const plate = reservation.car?.plate ?? null;

	return (
		<tr className='hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30'>
			<td className='px-4 py-3'>
				{reservation.booking_code ? (
					<span className='inline-flex items-center rounded-md bg-amber-100 px-2 py-1 font-mono text-sm font-bold tracking-widest text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'>
						{reservation.booking_code}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
				)}
			</td>
			<td className='px-4 py-3'>
				{plate ? (
					<span className='font-mono text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-100'>
						{plate}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>Not provided yet</span>
				)}
			</td>
			<td className='px-4 py-3'>
				{reservation.park?.name ? (
					<span className='inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
						{reservation.park.name}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
				)}
			</td>
			<td className='px-4 py-3'>
				<div className='leading-tight'>
					<p className='text-sm'>
						{reservation.customer?.name ?? (
							<span className='text-zinc-400'>—</span>
						)}
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
				<span className='inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
					{reservation.is_pre_booking ? 'Pre-booking' : 'On-site hold'}
				</span>
			</td>
			<td className='px-4 py-3'>
				<StatusBadge label={reservation.status_label} />
			</td>
			<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
				{formatWhen(pickWhen(reservation))}
			</td>
			<td className='px-4 py-3 text-right'>
				<div className='inline-flex items-center gap-2'>
					{reservation.can_cancel ? (
						<ReservationActionButton
							id={reservation.id}
							mode='cancel'
							bookingCode={reservation.booking_code}
							plate={plate}
							redirectTo={redirectTo}
						/>
					) : null}
					{reservation.can_exit_car ? (
						<ReservationActionButton
							id={reservation.id}
							mode='exit'
							bookingCode={reservation.booking_code}
							plate={plate}
							redirectTo={redirectTo}
						/>
					) : null}
					{!reservation.can_cancel && !reservation.can_exit_car ? (
						<span className='text-xs text-zinc-400'>—</span>
					) : null}
				</div>
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
		label: 'Lapsed hold',
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
		className: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
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

/**
 * Pick the most meaningful timestamp for a row: pre-bookings show when the
 * customer plans to arrive; everything else shows when it was created.
 */
function pickWhen(r: OwnerReservation): string | null {
	if (r.is_pre_booking && r.scheduled_at) return r.scheduled_at;
	return r.created_at;
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
