import { getCurrentUser } from '@/app/lib/auth/dal';
import { listMyParks } from '@/app/lib/parks/api';
import { listOwnerReservations } from '@/app/lib/reservations/api';
import { canManageOwnerReservations } from '@/app/lib/reservations/permissions';

import { TelegramBackButton } from '../components/telegram-back-button';
import { ReservationsClient } from './reservations-client';

/**
 * Owner reservations.
 *
 * The initial page is fetched on the server so the owner sees today's arrivals
 * immediately; the client takes over for filtering and the admit/exit actions.
 */
export default async function OwnerReservationsPage() {
	const user = await getCurrentUser();

	if (!canManageOwnerReservations(user)) {
		return (
			<main className='flex min-h-dvh flex-col items-center justify-center px-8 text-center'>
				<TelegramBackButton href='/miniapp' />
				<h1 className='sp-animate-in text-lg font-semibold'>غير متاح</h1>
				<p
					className='sp-animate-in mt-2 max-w-xs text-sm leading-relaxed'
					style={{ color: 'var(--sp-muted)', animationDelay: '80ms' }}
				>
					إدارة الحجوزات متاحة لأصحاب المواقف فقط.
				</p>
			</main>
		);
	}

	const [res, parksRes] = await Promise.all([
		listOwnerReservations({ filter: 'live' }),
		listMyParks(1),
	]);

	const initial = res.ok ? (res.data.data ?? []) : [];
	const parks = parksRes.ok ? (parksRes.data.data ?? []) : [];

	return (
		<main className='pb-10'>
			<TelegramBackButton href='/miniapp' />

			<header className='sp-animate-in px-5 pb-1 pt-6'>
				<h1 className='text-2xl font-bold leading-tight'>الحجوزات</h1>
				<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
					أدخِل السيارات الواصلة وأنهِ الحجوزات
				</p>
			</header>

			<ReservationsClient
				initialReservations={initial}
				parks={parks.map((p) => ({ id: p.id, name: p.name }))}
			/>
		</main>
	);
}
