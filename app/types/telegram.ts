/**
 * Ambient types for the Telegram Mini Apps SDK (`telegram-web-app.js`).
 *
 * Telegram ships the SDK as a plain script that assigns `window.Telegram`, so
 * there is no package to import types from — we declare the surface we actually
 * use. Every member is optional-by-capability: older Telegram clients simply do
 * not implement newer methods, which is why callers must feature-detect through
 * the helpers in `app/lib/miniapp/telegram.ts` rather than calling directly.
 *
 * Reference: https://core.telegram.org/bots/webapps
 */

/** Telegram user as embedded in `initDataUnsafe`. */
export interface TelegramWebAppUser {
	id: number;
	is_bot?: boolean;
	first_name: string;
	last_name?: string;
	username?: string;
	language_code?: string;
	is_premium?: boolean;
	photo_url?: string;
}

/**
 * Colour scheme Telegram hands the Mini App. Keys mirror the CSS variables
 * Telegram also injects (`--tg-theme-*`), which is what we bind to in CSS.
 */
export interface TelegramThemeParams {
	bg_color?: string;
	text_color?: string;
	hint_color?: string;
	link_color?: string;
	button_color?: string;
	button_text_color?: string;
	secondary_bg_color?: string;
	header_bg_color?: string;
	bottom_bar_bg_color?: string;
	accent_text_color?: string;
	section_bg_color?: string;
	section_header_text_color?: string;
	subtitle_text_color?: string;
	destructive_text_color?: string;
}

export type TelegramHapticStyle =
	| 'light'
	| 'medium'
	| 'heavy'
	| 'rigid'
	| 'soft';

export type TelegramNotificationType = 'error' | 'success' | 'warning';

export interface TelegramHapticFeedback {
	impactOccurred(style: TelegramHapticStyle): void;
	notificationOccurred(type: TelegramNotificationType): void;
	selectionChanged(): void;
}

export interface TelegramBackButton {
	isVisible: boolean;
	show(): void;
	hide(): void;
	onClick(cb: () => void): void;
	offClick(cb: () => void): void;
}

export interface TelegramMainButton {
	text: string;
	color: string;
	textColor: string;
	isVisible: boolean;
	isActive: boolean;
	isProgressVisible: boolean;
	setText(text: string): void;
	show(): void;
	hide(): void;
	enable(): void;
	disable(): void;
	showProgress(leaveActive?: boolean): void;
	hideProgress(): void;
	onClick(cb: () => void): void;
	offClick(cb: () => void): void;
	setParams(params: {
		text?: string;
		color?: string;
		text_color?: string;
		is_active?: boolean;
		is_visible?: boolean;
	}): void;
}

/** The subset of `window.Telegram.WebApp` this app relies on. */
export interface TelegramWebApp {
	/** Raw signed launch payload — the only value the backend trusts. */
	initData: string;
	/** Client-side mirror of `initData`. Convenient, but NEVER authoritative. */
	initDataUnsafe: {
		user?: TelegramWebAppUser;
		auth_date?: number;
		hash?: string;
		start_param?: string;
		query_id?: string;
	};
	version: string;
	platform: string;
	colorScheme: 'light' | 'dark';
	themeParams: TelegramThemeParams;
	isExpanded: boolean;
	viewportHeight: number;
	viewportStableHeight: number;
	headerColor: string;
	backgroundColor: string;

	/** Present from Bot API 8.0 — full-screen safe-area handling. */
	safeAreaInset?: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
	contentSafeAreaInset?: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	};

	BackButton: TelegramBackButton;
	MainButton: TelegramMainButton;
	HapticFeedback: TelegramHapticFeedback;

	ready(): void;
	expand(): void;
	close(): void;
	/** Bot API 7.7+ — blocks the swipe-down-to-dismiss gesture. */
	disableVerticalSwipes?(): void;
	enableVerticalSwipes?(): void;
	/** Bot API 6.2+ — native confirm dialog. */
	showConfirm?(message: string, cb: (ok: boolean) => void): void;
	showAlert?(message: string, cb?: () => void): void;
	setHeaderColor?(color: string): void;
	setBackgroundColor?(color: string): void;
	openLink(url: string, options?: { try_instant_view?: boolean }): void;
	openTelegramLink(url: string): void;
	onEvent(event: string, cb: () => void): void;
	offEvent(event: string, cb: () => void): void;
}

declare global {
	interface Window {
		Telegram?: { WebApp?: TelegramWebApp };
	}
}

/** Payload accepted by `POST /api/miniapp/auth` (the Next route handler). */
export interface MiniAppAuthPayload {
	init_data: string;
}

/** Shape returned by the Laravel Mini App auth endpoint. */
export interface MiniAppAuthResponse {
	message: string;
	token: string;
}
