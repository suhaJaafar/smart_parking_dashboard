/**
 * Display formatting for the Mini App.
 *
 * Kept free of `server-only` so both server and client components can use it.
 */

/**
 * Distance in human terms: metres up close, one decimal of a kilometre beyond.
 * Precision below a metre is noise to someone deciding where to park.
 */
export function formatDistance(meters: number | null): string {
	if (meters === null || !Number.isFinite(meters)) return '—';
	if (meters < 1000) return `${Math.round(meters)} م`;
	return `${(meters / 1000).toFixed(1)} كم`;
}

/**
 * Money without the noise. Backend sends 3-decimal strings (IQD), but trailing
 * zeros on a whole-dinar price are just clutter on a phone.
 */
export function formatPrice(
	price: string | number | null,
	currency = 'د.ع',
): string {
	if (price === null || price === '') return '—';
	const value = typeof price === 'number' ? price : Number(price);
	if (!Number.isFinite(value)) return '—';

	return `${new Intl.NumberFormat('en-US', {
		maximumFractionDigits: value % 1 === 0 ? 0 : 3,
	}).format(value)} ${currency}`;
}

/**
 * Remaining time until an ISO timestamp, as "9m 30s" / "1h 04m".
 * Returns null once the deadline has passed so callers can branch on expiry.
 */
export function formatCountdown(iso: string | null): string | null {
	if (!iso) return null;

	const remaining = new Date(iso).getTime() - Date.now();
	if (!Number.isFinite(remaining) || remaining <= 0) return null;

	const totalSeconds = Math.floor(remaining / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) return `${hours}س ${String(minutes).padStart(2, '0')}د`;
	return `${minutes}د ${String(seconds).padStart(2, '0')}ث`;
}

/** Availability tone for a park, driving the colour of its badge. */
export function availabilityTone(
	free: number,
	capacity: number,
): 'plenty' | 'limited' | 'full' {
	if (free <= 0) return 'full';
	if (capacity > 0 && free / capacity <= 0.2) return 'limited';
	return 'plenty';
}

/**
 * Dates are pinned to the country the product operates in rather than the
 * device zone. That is not cosmetic: these strings are produced during SSR and
 * again on the client, and an unpinned formatter would disagree between the two
 * and trip a hydration mismatch.
 */
const APP_TIME_ZONE = 'Asia/Baghdad';

/** `-u-nu-latn` forces Latin digits — the rest of the UI uses them, and mixing
 *  numeral systems in one screen reads as a rendering bug. */
const AR_LOCALE = 'ar-IQ-u-nu-latn';

function toDate(iso: string | null): Date | null {
	if (!iso) return null;
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** "20 تموز، 9:20 ص" — day and time, the two things a receipt needs. */
export function formatDateTime(iso: string | null): string {
	const date = toDate(iso);
	if (!date) return '—';

	return new Intl.DateTimeFormat(AR_LOCALE, {
		day: 'numeric',
		month: 'long',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
		timeZone: APP_TIME_ZONE,
	}).format(date);
}

/** Heading for a month group, e.g. "تموز 2026". */
export function formatMonthLabel(iso: string | null): string {
	const date = toDate(iso);
	if (!date) return '—';

	return new Intl.DateTimeFormat(AR_LOCALE, {
		month: 'long',
		year: 'numeric',
		timeZone: APP_TIME_ZONE,
	}).format(date);
}

/**
 * Sortable `YYYY-MM` bucket for grouping, in the app's zone rather than UTC —
 * a stay at 1am Baghdad on the 1st belongs to that month, not the previous one.
 */
export function monthKey(iso: string | null): string {
	const date = toDate(iso);
	if (!date) return 'unknown';

	// en-CA renders as YYYY-MM-DD, so the first seven characters are the month.
	return new Intl.DateTimeFormat('en-CA', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		timeZone: APP_TIME_ZONE,
	})
		.format(date)
		.slice(0, 7);
}

/**
 * Short, human message for an action error code.
 *
 * `detail` carries context the backend supplied — currently the name of the
 * garage a driver is still tied to. Naming it turns a dead end into an
 * instruction.
 */
export function messageForError(code: string, detail?: string): string {
	switch (code) {
		case 'invalid_location':
			return 'تعذّر تحديد موقعك. حاول مرة أخرى.';
		case 'location_denied':
			return 'صلاحية الموقع مغلقة.';
		case 'unavailable':
			return 'امتلأ هذا الموقف للتو. اختر موقفاً آخر.';
		case 'car_inside_elsewhere':
			return detail
				? `سيارتك ما زالت داخل ${detail}. يجب إخراجها أولاً قبل الحجز من جديد.`
				: 'سيارتك ما زالت داخل موقف آخر. يجب إخراجها أولاً.';
		case 'hold_elsewhere':
			return detail
				? `لديك حجز فعّال في ${detail}. ألغِه أولاً ثمّ احجز هنا.`
				: 'لديك حجز فعّال في موقف آخر. ألغِه أولاً.';
		case 'park_unavailable':
			return 'هذا الموقف غير متاح للحجز حالياً.';
		case 'not_found':
			return 'لم يعد هذا الموقف متاحاً.';
		case 'forbidden':
			return 'لا يمكن لحسابك تنفيذ هذا الإجراء.';
		case 'unauthenticated':
			return 'انتهت الجلسة. أعد فتح التطبيق من البوت.';
		case 'rate_limited':
			return 'محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة.';
		default:
			return 'حدث خطأ ما. حاول مرة أخرى.';
	}
}
