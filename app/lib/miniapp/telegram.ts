import type {
	TelegramHapticStyle,
	TelegramNotificationType,
	TelegramWebApp,
} from '@/app/types/telegram';

/**
 * Safe accessors for the Telegram Mini Apps SDK.
 *
 * Two hard rules drive this module:
 *
 *  1. **Never assume the SDK is there.** The app must still render in a plain
 *     browser (local development, or a user pasting the URL), so every helper
 *     no-ops instead of throwing when `window.Telegram` is absent.
 *  2. **Never assume a method exists.** Telegram clients ship capabilities per
 *     Bot API version and older installs simply lack the newer ones, so each
 *     call is feature-detected rather than version-sniffed.
 */

/** The live WebApp instance, or null outside Telegram. */
export function getWebApp(): TelegramWebApp | null {
	if (typeof window === 'undefined') return null;
	return window.Telegram?.WebApp ?? null;
}

/** Are we actually running inside a Telegram WebView? */
export function isTelegramEnvironment(): boolean {
	const app = getWebApp();
	// `initData` is empty when the page is opened outside Telegram, which is the
	// most reliable signal — `window.Telegram` alone can exist without a session.
	return Boolean(app && app.initData.length > 0);
}

/** Raw signed launch payload to hand to the backend. Empty when unavailable. */
export function getInitData(): string {
	return getWebApp()?.initData ?? '';
}

/**
 * Announce readiness and claim the full viewport.
 *
 * `ready()` tells Telegram to hide its loading placeholder — until it is called
 * the user stares at a spinner, so this must run as early as the app mounts.
 */
export function initializeViewport(): void {
	const app = getWebApp();
	if (!app) return;

	app.ready();
	app.expand();

	// Stop the swipe-down gesture from dismissing the app mid-scroll. Present
	// from Bot API 7.7; harmless to skip on older clients.
	app.disableVerticalSwipes?.();
}

/* ------------------------------- Haptics -------------------------------- */

/**
 * Physical feedback for a discrete action (tap, toggle, commit).
 *
 * Haptics are what make a Mini App feel native rather than like a web page in a
 * frame, so they are wired into every primary interaction.
 */
export function hapticImpact(style: TelegramHapticStyle = 'light'): void {
	try {
		getWebApp()?.HapticFeedback?.impactOccurred(style);
	} catch {
		// Unsupported client — feedback is decorative, never load-bearing.
	}
}

/** Feedback for an outcome (success / warning / error). */
export function hapticNotification(type: TelegramNotificationType): void {
	try {
		getWebApp()?.HapticFeedback?.notificationOccurred(type);
	} catch {
		/* no-op */
	}
}

/** Feedback for moving between options in a list or segmented control. */
export function hapticSelection(): void {
	try {
		getWebApp()?.HapticFeedback?.selectionChanged();
	} catch {
		/* no-op */
	}
}

/* ------------------------------ Navigation ------------------------------ */

/**
 * Drive Telegram's native back button.
 *
 * Returns a cleanup function that both hides the button and detaches the
 * listener, so callers can hand it straight back from a `useEffect`.
 */
export function bindBackButton(onBack: () => void): () => void {
	const app = getWebApp();
	if (!app?.BackButton) return () => {};

	app.BackButton.onClick(onBack);
	app.BackButton.show();

	return () => {
		app.BackButton.offClick(onBack);
		app.BackButton.hide();
	};
}

/**
 * Open an external URL through Telegram so it uses the in-app browser rather
 * than punting the user out to Safari/Chrome and losing the session.
 */
export function openExternalLink(url: string): void {
	const app = getWebApp();
	if (app) {
		app.openLink(url);
		return;
	}
	if (typeof window !== 'undefined') {
		window.open(url, '_blank', 'noopener,noreferrer');
	}
}

/** Native confirm dialog, falling back to the browser's when unavailable. */
export function confirmAction(message: string): Promise<boolean> {
	return new Promise((resolve) => {
		const app = getWebApp();
		if (app?.showConfirm) {
			app.showConfirm(message, resolve);
			return;
		}
		resolve(typeof window !== 'undefined' ? window.confirm(message) : false);
	});
}

/* -------------------------------- Theme --------------------------------- */

/**
 * Project Telegram's theme onto our own CSS custom properties.
 *
 * Only the *neutrals* are adopted, so the app sits naturally inside whatever
 * chrome the client is wearing. The accent is deliberately excluded: taking
 * `button_color` would repaint the brand a different colour on every user's
 * theme, which is why this app used to look orange on one client and blue on
 * the next.
 */
export function applyTelegramTheme(): void {
	const app = getWebApp();
	if (typeof document === 'undefined') return;

	const root = document.documentElement;
	const params = app?.themeParams ?? {};
	const isDark = app?.colorScheme === 'dark';

	const palette: Record<string, string | undefined> = {
		'--sp-bg': params.bg_color,
		'--sp-surface': params.section_bg_color ?? params.secondary_bg_color,
		'--sp-surface-alt': params.secondary_bg_color,
		'--sp-text': params.text_color,
		'--sp-muted': params.hint_color ?? params.subtitle_text_color,
		'--sp-danger': params.destructive_text_color,
	};

	for (const [token, value] of Object.entries(palette)) {
		if (value) root.style.setProperty(token, value);
	}

	root.dataset.tgTheme = isDark ? 'dark' : 'light';
	root.style.colorScheme = isDark ? 'dark' : 'light';

	// The MainButton is rendered by Telegram outside our DOM, so it cannot pick
	// up a CSS variable and defaults to the client's blue unless told otherwise.
	// Reading the computed token keeps the stylesheet the single source of truth
	// and picks up the dark-mode step automatically.
	const styles = getComputedStyle(root);
	const accent = styles.getPropertyValue('--sp-accent').trim();
	const accentText = styles.getPropertyValue('--sp-accent-text').trim();
	if (accent && accentText) {
		app?.MainButton?.setParams({ color: accent, text_color: accentText });
	}
}

/**
 * Publish safe-area insets as CSS variables.
 *
 * Since Bot API 8.0 a Mini App can occupy the full screen, which puts content
 * under the notch and the home indicator unless we pad for it.
 */
export function applySafeAreaInsets(): void {
	const app = getWebApp();
	if (typeof document === 'undefined') return;

	const root = document.documentElement;
	const safe = app?.contentSafeAreaInset ?? app?.safeAreaInset;
	if (!safe) return;

	root.style.setProperty('--sp-safe-top', `${safe.top}px`);
	root.style.setProperty('--sp-safe-bottom', `${safe.bottom}px`);
	root.style.setProperty('--sp-safe-left', `${safe.left}px`);
	root.style.setProperty('--sp-safe-right', `${safe.right}px`);
}
