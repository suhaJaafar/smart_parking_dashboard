'use client';

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';

import {
	applySafeAreaInsets,
	applyTelegramTheme,
	getInitData,
	initializeViewport,
} from '@/app/lib/miniapp/telegram';
import {
	getServerTelegramSnapshot,
	getTelegramSnapshot,
	subscribeTelegram,
} from '@/app/lib/miniapp/telegram-store';
import type { TelegramWebAppUser } from '@/app/types/telegram';

/**
 * Boot state of the Mini App session.
 *
 *  bootstrapping  — SDK is initialising / auth request in flight
 *  authenticated  — cookie is set; server components can render real data
 *  outside        — not running inside Telegram (plain browser)
 *  failed         — signature rejected, network error, or backend refusal
 */
export type MiniAppStatus =
	| 'bootstrapping'
	| 'authenticated'
	| 'outside'
	| 'failed';

/** Outcome of SDK detection plus the initData → cookie exchange. */
type AuthState = 'detecting' | 'authenticated' | 'failed' | 'outside';

/**
 * How long to wait for `telegram-web-app.js` before concluding we are not
 * inside Telegram. Generous enough for a cold WebView on a slow connection,
 * short enough that a browser visitor is not left staring at a splash.
 */
const SDK_DETECT_TIMEOUT_MS = 3000;
const SDK_POLL_INTERVAL_MS = 100;

interface MiniAppContextValue {
	status: MiniAppStatus;
	/** Client-side profile from Telegram. Display only — never trusted for auth. */
	telegramUser: TelegramWebAppUser | null;
	colorScheme: 'light' | 'dark';
	/** Retry the auth exchange after a failure. */
	retry: () => void;
}

const MiniAppContext = createContext<MiniAppContextValue | null>(null);

/** Access the Mini App session. Throws outside the provider (a wiring bug). */
export function useMiniApp(): MiniAppContextValue {
	const ctx = useContext(MiniAppContext);
	if (!ctx) {
		throw new Error('useMiniApp must be used within <MiniAppProvider>.');
	}
	return ctx;
}

export function MiniAppProvider({
	children,
	/** True when the server already resolved a session from the cookie. */
	hasServerSession,
}: {
	children: React.ReactNode;
	hasServerSession: boolean;
}) {
	const router = useRouter();

	// Telegram is a mutable global that emits events — read it as an external
	// store so SSR, hydration, and later theme changes all stay consistent.
	const telegram = useSyncExternalStore(
		subscribeTelegram,
		getTelegramSnapshot,
		getServerTelegramSnapshot,
	);

	const [authState, setAuthState] = useState<AuthState>(
		hasServerSession ? 'authenticated' : 'detecting',
	);
	const [attempt, setAttempt] = useState(0);

	// Guards the exchange so React's development double-invoke (and any
	// re-render) can never fire two concurrent logins for one launch.
	const exchangeStarted = useRef(false);

	const retry = useCallback(() => {
		exchangeStarted.current = false;
		setAuthState('detecting');
		setAttempt((n) => n + 1);
	}, []);

	/* ------------------ Push theme + viewport into the DOM ---------------- */

	// Updating an external system (the document) is exactly what an effect is
	// for. Re-running on `telegram` re-applies the palette whenever the user
	// switches Telegram's theme.
	useEffect(() => {
		initializeViewport();
		applyTelegramTheme();
		applySafeAreaInsets();
	}, [telegram]);

	/* -------------------- Detect the SDK, then authenticate --------------- */

	useEffect(() => {
		// A cookie from a previous launch is still valid — skip the round trip.
		if (hasServerSession) return;
		if (exchangeStarted.current) return;

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout>;
		const controller = new AbortController();
		const deadline = Date.now() + SDK_DETECT_TIMEOUT_MS;

		const authenticate = async (initData: string) => {
			exchangeStarted.current = true;
			try {
				const res = await fetch('/api/miniapp/auth', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ init_data: initData }),
					signal: controller.signal,
				});
				if (cancelled) return;

				if (!res.ok) {
					setAuthState('failed');
					return;
				}

				setAuthState('authenticated');
				// Re-render server components now that the cookie exists, so the
				// role-aware home can fetch real data.
				router.refresh();
			} catch (cause) {
				if (cancelled || controller.signal.aborted) return;
				if (process.env.NODE_ENV !== 'production') {
					console.warn('[miniapp] auth exchange failed', cause);
				}
				setAuthState('failed');
			}
		};

		// The SDK is injected by an `afterInteractive` script, so it may land a
		// few frames after mount. Poll for it instead of sampling once — and
		// always resolve to *some* state, so a missing SDK can never strand the
		// user on the boot splash.
		const poll = () => {
			if (cancelled) return;

			const initData = getInitData();
			if (initData) {
				void authenticate(initData);
				return;
			}

			if (Date.now() >= deadline) {
				setAuthState('outside');
				return;
			}

			timer = setTimeout(poll, SDK_POLL_INTERVAL_MS);
		};

		// Deferred by a tick so the state transition happens in a timer
		// callback rather than synchronously inside the effect body.
		timer = setTimeout(poll, 0);

		return () => {
			cancelled = true;
			clearTimeout(timer);
			controller.abort();
		};
	}, [hasServerSession, attempt, router]);

	/* ---------------------------- Derived status -------------------------- */

	// Derived during render rather than mirrored into state, so there is a
	// single source of truth and no effect-driven cascade.
	const status: MiniAppStatus =
		authState === 'authenticated'
			? 'authenticated'
			: authState === 'failed'
				? 'failed'
				: authState === 'outside'
					? 'outside'
					: 'bootstrapping';

	return (
		<MiniAppContext.Provider
			value={{
				status,
				telegramUser: telegram.user,
				colorScheme: telegram.colorScheme,
				retry,
			}}
		>
			{children}
		</MiniAppContext.Provider>
	);
}
