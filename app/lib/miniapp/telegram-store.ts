import { getWebApp } from './telegram';
import type { TelegramWebAppUser } from '@/app/types/telegram';

/**
 * Telegram as a React external store.
 *
 * The SDK is a mutable global that emits events — precisely the case
 * `useSyncExternalStore` exists for. Reading it through a store (rather than
 * copying it into state inside an effect) keeps React's rendering consistent
 * during SSR and hydration, and avoids the cascading re-renders that
 * `setState`-in-effect produces.
 */

export interface TelegramSnapshot {
	/**
	 * False during SSR and the hydration render, true from the first
	 * client-side read onward. Lets consumers hold a neutral loading state
	 * until the real environment is known, instead of flashing the wrong screen.
	 */
	ready: boolean;
	/** True only when Telegram supplied a signed launch payload. */
	isTelegram: boolean;
	colorScheme: 'light' | 'dark';
	/** Display-only profile. Never an authorisation input. */
	user: TelegramWebAppUser | null;
}

/**
 * Stable server/hydration snapshot. Must be a module-level constant —
 * returning a fresh object would make React see an endlessly changing store.
 */
const SERVER_SNAPSHOT: TelegramSnapshot = {
	ready: false,
	isTelegram: false,
	colorScheme: 'light',
	user: null,
};

let cached: TelegramSnapshot | null = null;
const listeners = new Set<() => void>();

/** Telegram events that can change anything in the snapshot. */
const WATCHED_EVENTS = ['themeChanged', 'viewportChanged', 'safeAreaChanged'];

function read(): TelegramSnapshot {
	const app = getWebApp();
	return {
		ready: true,
		isTelegram: Boolean(app && app.initData.length > 0),
		colorScheme: app?.colorScheme ?? 'light',
		user: app?.initDataUnsafe.user ?? null,
	};
}

function sameSnapshot(a: TelegramSnapshot, b: TelegramSnapshot): boolean {
	return (
		a.ready === b.ready &&
		a.isTelegram === b.isTelegram &&
		a.colorScheme === b.colorScheme &&
		a.user?.id === b.user?.id
	);
}

/**
 * Current snapshot, cached so repeated reads are referentially equal — React
 * bails out of re-rendering when the identity is unchanged.
 */
export function getTelegramSnapshot(): TelegramSnapshot {
	if (!cached) cached = read();
	return cached;
}

export function getServerTelegramSnapshot(): TelegramSnapshot {
	return SERVER_SNAPSHOT;
}

/** Recompute and notify subscribers only when something actually changed. */
function refresh(): void {
	const next = read();
	if (cached && sameSnapshot(cached, next)) return;
	cached = next;
	for (const listener of listeners) listener();
}

/**
 * Subscribe to Telegram changes. A single set of SDK handlers is shared by all
 * subscribers and detached once the last one leaves.
 */
export function subscribeTelegram(onStoreChange: () => void): () => void {
	const first = listeners.size === 0;
	listeners.add(onStoreChange);

	const app = getWebApp();
	if (first && app) {
		for (const event of WATCHED_EVENTS) app.onEvent(event, refresh);
	}

	return () => {
		listeners.delete(onStoreChange);
		if (listeners.size === 0 && app) {
			for (const event of WATCHED_EVENTS) app.offEvent(event, refresh);
		}
	};
}
