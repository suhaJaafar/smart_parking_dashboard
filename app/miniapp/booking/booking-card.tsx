'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { cancelReservationAction } from '@/app/lib/miniapp/actions';
import {
	formatCountdown,
	formatPrice,
	messageForError,
} from '@/app/lib/miniapp/format';
import {
	confirmAction,
	hapticImpact,
	hapticNotification,
	openExternalLink,
} from '@/app/lib/miniapp/telegram';
import type { CustomerReservation } from '@/app/types/miniapp';

/**
 * The live booking: code, countdown, payment and cancellation.
 *
 * Client-side because the countdown ticks and the actions are interactive; the
 * reservation itself arrives pre-rendered from the server.
 */
export function BookingCard({
	reservation,
}: {
	reservation: CustomerReservation;
}) {
	const router = useRouter();
	const [isCancelling, startCancelling] = useTransition();
	const [errorCode, setErrorCode] = useState<string | null>(null);

	const isWaiting = reservation.status_label === 'waiting';
	const isActive = reservation.status_label === 'active';

	const cancel = () => {
		void (async () => {
			hapticImpact('medium');
			const confirmed = await confirmAction(
				'إلغاء الحجز؟ سيتم تحرير المكان المحجوز لك.',
			);
			if (!confirmed) return;

			startCancelling(async () => {
				const result = await cancelReservationAction(reservation.id);
				if (!result.ok) {
					hapticNotification('error');
					setErrorCode(result.error);
					return;
				}
				hapticNotification('success');
				router.refresh();
			});
		})();
	};

	return (
		<div className='space-y-4 px-5 pt-3'>
			{errorCode && (
				<div
					role='alert'
					className='sp-animate-in rounded-xl px-4 py-3 text-sm'
					style={{
						background: 'color-mix(in srgb, var(--sp-danger) 12%, transparent)',
						color: 'var(--sp-danger)',
					}}
				>
					{messageForError(errorCode)}
				</div>
			)}

			<BookingCodePanel reservation={reservation} isWaiting={isWaiting} />

			<div className='sp-card sp-animate-in px-5 py-4'>
				<Row label='الموقف' value={reservation.park?.name ?? '—'} />
				<Row
					label='السعر'
					value={formatPrice(reservation.park?.price ?? null)}
				/>
				<Row
					label='Type'
					value={reservation.is_pre_booking ? 'حجز مسبق' : 'حجز فوري'}
					last
				/>
			</div>

			{reservation.payment && (
				<PaymentPanel payment={reservation.payment} isActive={isActive} />
			)}

			{reservation.can_cancel && (
				<button
					type='button'
					disabled={isCancelling}
					onClick={cancel}
					className='sp-button-ghost sp-animate-in w-full px-6 py-3.5 text-sm disabled:opacity-50'
					style={{ color: 'var(--sp-danger)' }}
				>
					{isCancelling ? 'جارٍ الإلغاء…' : 'إلغاء الحجز'}
				</button>
			)}
		</div>
	);
}

/** Big, glanceable code plus the arrival countdown. */
function BookingCodePanel({
	reservation,
	isWaiting,
}: {
	reservation: CustomerReservation;
	isWaiting: boolean;
}) {
	const [countdown, setCountdown] = useState<string | null>(() =>
		formatCountdown(reservation.expires_at),
	);

	// Tick once a second while a hold is counting down. Interval callbacks are
	// outside the render path, so this never cascades renders.
	useEffect(() => {
		if (!isWaiting || !reservation.expires_at) return;

		const id = setInterval(() => {
			setCountdown(formatCountdown(reservation.expires_at));
		}, 1000);

		return () => clearInterval(id);
	}, [isWaiting, reservation.expires_at]);

	const expired = isWaiting && countdown === null;

	return (
		<div
			className='sp-card sp-animate-scale flex flex-col items-center px-5 py-6'
			style={{
				background:
					'color-mix(in srgb, var(--sp-accent) 12%, var(--sp-surface))',
			}}
		>
			<p
				className='text-xs font-semibold uppercase tracking-wider'
				style={{ color: 'var(--sp-muted)' }}
			>
				رمز الحجز
			</p>
			<p className='mt-2 font-mono text-5xl font-bold tabular-nums tracking-[0.2em]'>
				{reservation.booking_code ?? '----'}
			</p>

			{isWaiting && (
				<p
					className='mt-3 text-sm font-medium'
					style={{ color: expired ? 'var(--sp-danger)' : 'var(--sp-muted)' }}
				>
					{expired ? 'انتهت مدة الحجز' : `يرجى الوصول خلال ${countdown}`}
				</p>
			)}

			{!isWaiting && (
				<p className='mt-3 text-sm font-medium' style={{ color: '#22c55e' }}>
					سيارتك داخل الموقف
				</p>
			)}
		</div>
	);
}

function PaymentPanel({
	payment,
	isActive,
}: {
	payment: NonNullable<CustomerReservation['payment']>;
	isActive: boolean;
}) {
	if (payment.is_paid) {
		return (
			<div
				className='sp-card sp-animate-in flex items-center gap-3 px-5 py-4'
				style={{
					background: 'color-mix(in srgb, #22c55e 10%, var(--sp-surface))',
				}}
			>
				<span className='text-lg' aria-hidden='true'>
					✅
				</span>
				<div>
					<p className='text-sm font-semibold'>تم استلام الدفعة</p>
					<p className='text-sm' style={{ color: 'var(--sp-muted)' }}>
						{formatPrice(payment.amount, payment.currency)}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='sp-card sp-animate-in px-5 py-4'>
			<div className='flex items-baseline justify-between'>
				<p className='text-sm font-semibold'>المبلغ المستحق</p>
				<p className='text-base font-bold'>
					{formatPrice(payment.amount, payment.currency)}
				</p>
			</div>

			<button
				type='button'
				onClick={() => {
					hapticImpact('medium');
					// Opened through Telegram so the gateway runs in the in-app
					// browser and the Mini App session survives.
					openExternalLink(payment.pay_url);
				}}
				className='sp-button mt-3.5 w-full px-6 py-3 text-sm'
			>
				ادفع الآن
			</button>

			{isActive && (
				<p className='mt-2.5 text-xs' style={{ color: 'var(--sp-muted)' }}>
					ادفع قبل المغادرة ليتمكّن صاحب الموقف من إخراج سيارتك.
				</p>
			)}
		</div>
	);
}

function Row({
	label,
	value,
	last = false,
}: {
	label: string;
	value: string;
	last?: boolean;
}) {
	return (
		<div
			className={`flex items-baseline justify-between gap-3 ${
				last ? '' : 'sp-divider border-b pb-2.5'
			} ${last ? 'pt-2.5' : 'pt-0'}`}
		>
			<span className='text-sm' style={{ color: 'var(--sp-muted)' }}>
				{label}
			</span>
			<span className='truncate text-sm font-medium'>{value}</span>
		</div>
	);
}
