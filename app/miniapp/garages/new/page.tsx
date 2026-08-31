import { TelegramBackButton } from '../../components/telegram-back-button';
import { NewParkForm } from './new-park-form';

/**
 * إضافة موقف جديد.
 *
 * An owner can register any number of garages; the form is intentionally short
 * — name, capacity, price, location — because everything else has a sensible
 * default and can be edited later.
 */
export default function NewParkPage() {
	return (
		<main className='pb-10'>
			<TelegramBackButton href='/miniapp/garages' />

			<header className='sp-animate-in px-5 pb-1 pt-6'>
				<h1 className='text-2xl font-bold leading-tight'>موقف جديد</h1>
				<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
					سجّل موقفاً إضافياً وابدأ باستقبال الحجوزات
				</p>
			</header>

			<NewParkForm />
		</main>
	);
}
