import { listReservationHistory } from '@/app/lib/miniapp/api';

import { TelegramBackButton } from '../components/telegram-back-button';
import { HistoryClient } from './history-client';

/**
 * The customer's log of settled bookings and what they paid.
 *
 * The first page is server-rendered so the log is readable in the first paint;
 * the client takes over for filtering and paging. Totals come from the backend
 * rather than being summed from the visible rows — a page is 15 entries, and
 * adding those up would quietly under-report someone's spend.
 */
export default async function HistoryPage() {
	const res = await listReservationHistory({ filter: 'all', page: 1 });

	return (
		<main className='pb-10'>
			<TelegramBackButton href='/miniapp' />

			<header className='sp-animate-in px-5 pb-1 pt-6'>
				<h1 className='text-2xl font-bold leading-tight'>السجل</h1>
				<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
					حجوزاتك ومدفوعاتك السابقة
				</p>
			</header>

			{res.ok ? <HistoryClient initial={res.data} /> : <LoadFailed />}
		</main>
	);
}

/** Distinct from "no history yet" — this one is worth retrying. */
function LoadFailed() {
	return (
		<div className='flex flex-col items-center px-8 pt-16 text-center'>
			<div
				className='sp-animate-scale flex size-14 items-center justify-center rounded-full'
				style={{
					background: 'color-mix(in srgb, var(--sp-danger) 12%, transparent)',
				}}
			>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					className='size-7'
					aria-hidden='true'
				>
					<path
						d='M12 8v5m0 3.5h.01M10.3 3.9 2.6 17.2a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'
						stroke='var(--sp-danger)'
						strokeWidth='1.8'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			</div>

			<h2 className='sp-animate-in mt-5 text-base font-semibold'>
				تعذّر تحميل السجل
			</h2>
			<p
				className='sp-animate-in mt-2 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)', animationDelay: '80ms' }}
			>
				تحقّق من اتصالك ثم أعد فتح الصفحة.
			</p>
		</div>
	);
}
