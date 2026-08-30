import { getCurrentUser } from '@/app/lib/auth/dal';
import { isAdmin, isSpaceOwner } from '@/app/lib/auth/permissions';

import { TelegramBackButton } from '../components/telegram-back-button';
import { RoleSwitcher } from './role-switcher';

/**
 * الإعدادات — account-level choices.
 *
 * Currently one thing: which role the account plays. Kept off the home screen
 * so a driver's main view stays focused on parking, matching the bot where
 * role switching is a menu command rather than a primary action.
 */
export default async function SettingsPage() {
	const user = await getCurrentUser();
	const isOwner = isSpaceOwner(user) || isAdmin(user);

	return (
		<main className='pb-10'>
			<TelegramBackButton href='/miniapp' />

			<header className='sp-animate-in px-5 pb-1 pt-6'>
				<h1 className='text-2xl font-bold leading-tight'>الإعدادات</h1>
				<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
					{user?.name ?? ''}
				</p>
			</header>

			<RoleSwitcher
				currentRole={isOwner ? 'owner' : 'customer'}
				hasPhone={Boolean(user?.phone_number)}
			/>
		</main>
	);
}
