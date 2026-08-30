'use client';

import { formatCountdown } from '@/app/lib/miniapp/format';
import { hapticImpact } from '@/app/lib/miniapp/telegram';
import type {
	OwnerReservation,
	ReservationStatusLabel,
} from '@/app/types/reservation';

/** Badge palette, keyed by the backend's status slug. */
const STATUS_STYLE: Record<
	ReservationStatusLabel,
	{ label: string; color: string }
> = {
	waiting: { label: 'بانتظار الدخول', color: 'var(--sp-accent)' },
	lapsed: { label: 'منتهٍ', color: '#f97316' },
	active: { label: 'بالداخل', color: '#22c55e' },
	completed: { label: 'مكتمل', color: 'var(--sp-muted)' },
	expired: { label: 'منتهٍ', color: 'var(--sp-danger)' },
	cancelled: { label: 'ملغي', color: 'var(--sp-danger)' },
	unknown: { label: 'غير معروف', color: 'var(--sp-muted)' },
};

/**
 * One reservation, with the actions the backend says are legal for it.
 *
 * Action visibility comes straight from `can_admit` / `can_exit_car` /
 * `can_cancel` — the UI never re-derives lifecycle rules.
 */
export function ReservationCard({
	reservation,
	busy,
	onAdmit,
	onExit,
	onCancel,
}: {
	reservation: OwnerReservation;
	busy: boolean;
	onAdmit: (r: OwnerReservation) => void;
	onExit: (r: OwnerReservation) => void;
	onCancel: (r: OwnerReservation) => void;
}) {
	const status = STATUS_STYLE[reservation.status_label] ?? STATUS_STYLE.unknown;
	const countdown =
		reservation.status_label === 'waiting'
			? formatCountdown(reservation.expires_at)
			: null;

	return (
		<article className='sp-card px-4 py-3.5'>
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0'>
					<div className='flex items-center gap-2'>
						<span className='font-mono text-lg font-bold tabular-nums tracking-wider'>
							{reservation.booking_code ?? '----'}
						</span>
						<span
							className='rounded-full px-2 py-0.5 text-[11px] font-semibold'
							style={{
								background: `color-mix(in srgb, ${status.color} 16%, transparent)`,
								color: status.color,
							}}
						>
							{status.label}
						</span>
						{reservation.is_pre_booking && (
							<span
								className='rounded-full px-2 py-0.5 text-[11px] font-medium'
								style={{
									background:
										'color-mix(in srgb, var(--sp-text) 8%, transparent)',
									color: 'var(--sp-muted)',
								}}
							>
								حجز مسبق
							</span>
						)}
					</div>

					<p className='mt-1.5 truncate text-sm font-medium'>
						{reservation.customer?.name ?? 'زبون غير معروف'}
					</p>
					<p
						className='mt-0.5 truncate text-sm'
						style={{ color: 'var(--sp-muted)' }}
					>
						{reservation.car?.plate ?? 'لا توجد سيارة مسجلة'}
						{reservation.park?.name ? ` · ${reservation.park.name}` : ''}
					</p>
				</div>

				{countdown && (
					<span
						className='shrink-0 text-sm font-semibold tabular-nums'
						style={{ color: 'var(--sp-accent)' }}
					>
						{countdown}
					</span>
				)}
			</div>

			{(reservation.can_admit ||
				reservation.can_exit_car ||
				reservation.can_cancel) && (
				<div className='sp-divider mt-3 flex gap-2 border-t pt-3'>
					{reservation.can_admit && (
						<button
							type='button'
							disabled={busy}
							onClick={() => {
								hapticImpact('medium');
								onAdmit(reservation);
							}}
							className='sp-button flex-1 px-4 py-2.5 text-sm disabled:opacity-50'
						>
							{busy ? 'جارٍ التنفيذ…' : 'إدخال'}
						</button>
					)}

					{reservation.can_exit_car && (
						<button
							type='button'
							disabled={busy}
							onClick={() => {
								hapticImpact('medium');
								onExit(reservation);
							}}
							className='sp-button flex-1 px-4 py-2.5 text-sm disabled:opacity-50'
							style={{ background: '#22c55e', color: '#06280f' }}
						>
							{busy ? 'جارٍ التنفيذ…' : 'إخراج'}
						</button>
					)}

					{reservation.can_cancel && (
						<button
							type='button'
							disabled={busy}
							onClick={() => {
								hapticImpact('light');
								onCancel(reservation);
							}}
							className='sp-button-ghost px-4 py-2.5 text-sm disabled:opacity-50'
							style={{ color: 'var(--sp-danger)' }}
						>
							إلغاء
						</button>
					)}
				</div>
			)}
		</article>
	);
}
