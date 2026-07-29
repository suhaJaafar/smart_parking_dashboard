import 'server-only';

import { requireAuth } from '@/app/lib/auth/dal';
import { getSessionToken } from '@/app/lib/auth/session';
import { siteConfig } from '@/app/config/site';

/**
 * Proxy an authenticated CSV export from the Laravel API back to the browser
 * as a file download.
 *
 * The JWT lives in an httpOnly cookie on the Next.js origin, so the browser
 * can't call the Laravel API directly. These route handlers run server-side,
 * read the token, forward the whitelisted query params, and stream the CSV
 * response straight through with its `Content-Disposition` intact.
 *
 * @param upstreamPath  Laravel path, e.g. `/api/owner/reservations/export`.
 * @param allowedParams Query keys forwarded upstream (everything else dropped).
 */
export async function proxyCsvExport(
	request: Request,
	upstreamPath: string,
	allowedParams: readonly string[],
): Promise<Response> {
	// Bounce unauthenticated callers to login (same guard the pages use).
	await requireAuth();

	const token = await getSessionToken();
	if (!token) {
		return new Response('Unauthorized', { status: 401 });
	}

	const incoming = new URL(request.url).searchParams;
	const forwarded = new URLSearchParams();
	for (const key of allowedParams) {
		const value = incoming.get(key);
		if (value !== null && value !== '') forwarded.set(key, value);
	}

	const qs = forwarded.toString();
	const upstreamUrl = `${siteConfig.apiUrl}${upstreamPath}${qs ? `?${qs}` : ''}`;

	const upstream = await fetch(upstreamUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'text/csv',
		},
		cache: 'no-store',
	});

	// On a validation / auth error the API returns JSON — pass the status and
	// body through so the caller sees a meaningful message instead of a
	// corrupt "download".
	if (!upstream.ok) {
		const body = await upstream.text();
		return new Response(body || 'Export failed.', {
			status: upstream.status,
			headers: {
				'Content-Type':
					upstream.headers.get('Content-Type') ?? 'application/json',
			},
		});
	}

	const disposition =
		upstream.headers.get('Content-Disposition') ??
		'attachment; filename=export.csv';

	return new Response(upstream.body, {
		status: 200,
		headers: {
			'Content-Type':
				upstream.headers.get('Content-Type') ?? 'text/csv; charset=UTF-8',
			'Content-Disposition': disposition,
			'Cache-Control': 'no-store',
		},
	});
}
