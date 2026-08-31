import Link from 'next/link';

import { getActiveReservation } from '@/app/lib/miniapp/api';

import { TelegramBackButton } from '../components/telegram-back-button';
import { BookingCard } from './booking-card';

/**
 * The customer's current booking.
 *
 * Server-rendered so the booking code is on screen in the first paint — this
 * is the screen someone opens while standing at a barrier, so it must not
 * wait on a client fetch.
 */
export default async function BookingPage() {
	const res = await getActiveReservation();
	const reservation = res.ok ? res.data.data : null;

	return (
		<main className='pb-10'>
			<TelegramBackButton href='/miniapp' />

			<header className='sp-animate-in px-5 pb-2 pt-6'>
				<h1 className='text-2xl font-bold leading-tight'>حجزي</h1>
				<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
					{reservation ? 'اعرض هذا الرمز عند وصولك' : 'لا يوجد لديك حجز فعّال'}
				</p>
			</header>

			{reservation ? (
				<BookingCard reservation={reservation} />
			) : (
				<EmptyBooking />
			)}
		</main>
	);
}

function EmptyBooking() {
	return (
		<div className='flex flex-col items-center px-8 pt-12 text-center'>
			<div
				className='sp-animate-scale flex size-14 items-center justify-center rounded-full'
				style={{
					background: 'color-mix(in srgb, var(--sp-accent) 14%, transparent)',
				}}
			>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					className='size-7'
					aria-hidden='true'
				>
					<path
						d='M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v2a2 2 0 0 0 0 4v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2 2 0 0 0 0-4v-2Z'
						stroke='var(--sp-accent)'
						strokeWidth='1.8'
						strokeLinejoin='round'
					/>
				</svg>
			</div>

			<p
				className='sp-animate-in mt-5 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)' }}
			>
				احجز مكاناً وسيظهر رمز الحجز هنا.
			</p>

			<Link
				href='/miniapp/nearby'
				className='sp-button sp-animate-in mt-6 px-6 py-3 text-sm'
				style={{ animationDelay: '120ms' }}
			>
				ابحث عن موقف قريب
			</Link>
		</div>
	);
}
