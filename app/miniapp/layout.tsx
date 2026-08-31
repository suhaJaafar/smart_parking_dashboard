import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import { getSessionToken } from '@/app/lib/auth/session';
import { MiniAppProvider } from './miniapp-provider';
import { MiniAppGate } from './miniapp-gate';

import './miniapp.css';

export const metadata: Metadata = {
	title: 'الموقف الذكي',
	description: 'ابحث عن موقف، احجز مكانك، وادفع — داخل تيليغرام.',
};

/**
 * `viewportFit: 'cover'` lets the app paint into the notch/home-indicator
 * region; the safe-area insets published by the SDK then pad the content back
 * off the hardware. `userScalable: false` stops a double-tap from zooming the
 * WebView, which otherwise feels broken next to Telegram's native screens.
 */
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: 'cover',
};

/**
 * Mini App shell.
 *
 * Deliberately separate from the dashboard layout: no sidebar, no top nav, no
 * desktop chrome. Telegram supplies the header and back button, so the app
 * renders only its own content.
 *
 * The session cookie is read here on the server so a returning user skips the
 * auth round trip entirely and the first paint already has their data.
 */
export default async function MiniAppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const hasServerSession = (await getSessionToken()) !== null;

	return (
		<>
			{/*
			  `beforeInteractive` is only honoured in the ROOT layout, so this
			  nested route uses `afterInteractive` and the provider polls for the
			  SDK rather than assuming it is present on first render.
			*/}
			<Script
				src='https://telegram.org/js/telegram-web-app.js'
				strategy='afterInteractive'
			/>

			<div
				dir='rtl'
				lang='ar'
				className='min-h-dvh bg-[var(--sp-bg)] text-[var(--sp-text)] antialiased'
				style={{
					paddingTop: 'var(--sp-safe-top)',
					paddingBottom: 'var(--sp-safe-bottom)',
					paddingLeft: 'var(--sp-safe-left)',
					paddingRight: 'var(--sp-safe-right)',
				}}
			>
				<MiniAppProvider hasServerSession={hasServerSession}>
					<MiniAppGate>{children}</MiniAppGate>
				</MiniAppProvider>
			</div>
		</>
	);
}
