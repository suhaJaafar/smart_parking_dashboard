'use client';

import Link from 'next/link';

import { hapticImpact } from '@/app/lib/miniapp/telegram';

/**
 * Settings entry point.
 *
 * Sits in the home header for every account. Where the bot exposes role
 * switching as menu option 8 ("تسجيل — تغيير الدور"), the Mini App puts it
 * behind this button so a plain driver is never shown owner-only controls on
 * their main screen.
 */
export function SettingsButton() {
	return (
		<Link
			href='/miniapp/settings'
			onClick={() => hapticImpact('light')}
			aria-label='الإعدادات'
			className='sp-pressable flex size-10 shrink-0 items-center justify-center rounded-full'
			style={{
				background: 'color-mix(in srgb, var(--sp-text) 7%, transparent)',
			}}
		>
			<svg
				viewBox='0 0 24 24'
				fill='none'
				className='size-5'
				aria-hidden='true'
			>
				<circle
					cx='12'
					cy='12'
					r='3.1'
					stroke='var(--sp-text)'
					strokeWidth='1.7'
				/>
				<path
					d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z'
					stroke='var(--sp-text)'
					strokeWidth='1.4'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
		</Link>
	);
}
