import { TelegramBackButton } from '../components/telegram-back-button';
import { NearbyClient } from './nearby-client';

/**
 * Nearby garages.
 *
 * The shell is a server component; everything below it is client-side because
 * the search is driven by the device's geolocation, which only exists in the
 * browser. Telegram draws the back button in its own header.
 */
export default function NearbyPage() {
	return (
		<main>
			<TelegramBackButton href='/miniapp' />

			<header className='sp-animate-in px-5 pb-2 pt-6'>
				<h1 className='text-2xl font-bold leading-tight'>مواقف قريبة</h1>
				<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
					اختر موقفاً واحجز مكانك
				</p>
			</header>

			<NearbyClient />
		</main>
	);
}
