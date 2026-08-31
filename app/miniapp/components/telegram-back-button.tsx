'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { bindBackButton, hapticImpact } from '@/app/lib/miniapp/telegram';

/**
 * Wires Telegram's native back button to a route.
 *
 * Renders nothing — Telegram draws the button in its own header, so a sub-screen
 * only has to declare where "back" goes. Falls back silently outside Telegram.
 */
export function TelegramBackButton({ href }: { href: string }) {
	const router = useRouter();

	useEffect(() => {
		return bindBackButton(() => {
			hapticImpact('light');
			router.push(href);
		});
	}, [href, router]);

	return null;
}
