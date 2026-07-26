/**
 * Whitelist for the `redirectTo` value that Server Actions accept from a
 * hidden form field.
 *
 * The reservation-action buttons live both on the dedicated list page and
 * embedded inside the parking-detail page, so the caller needs to tell the
 * action where to send the user back to. That value comes from the client
 * and MUST NEVER be trusted verbatim — an unfiltered `redirect()` on a
 * client-supplied string is a textbook open-redirect vulnerability.
 *
 * This helper accepts only same-origin absolute paths that live under
 * `/dashboard/`; anything else falls back to the safe default the caller
 * chose (the reservations list).
 */
export function safeRedirectTarget(
	raw: FormDataEntryValue | null,
	fallback: string,
): string {
	if (typeof raw !== 'string') return fallback;
	const trimmed = raw.trim();
	if (trimmed === '') return fallback;

	// Only allow same-origin absolute paths (no `//host`, no scheme).
	if (!trimmed.startsWith('/')) return fallback;
	if (trimmed.startsWith('//')) return fallback;

	// Restrict to the dashboard surface — the only place these actions run.
	if (!trimmed.startsWith('/dashboard/') && trimmed !== '/dashboard') {
		return fallback;
	}

	// Strip any query string / fragment the caller may have injected; the
	// action re-appends its own `?ok=` or `?error=` marker downstream.
	const withoutFragment = trimmed.split('#')[0] ?? trimmed;
	const withoutQuery = withoutFragment.split('?')[0] ?? withoutFragment;
	return withoutQuery || fallback;
}
