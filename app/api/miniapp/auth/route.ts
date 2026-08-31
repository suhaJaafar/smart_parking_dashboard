import { NextResponse } from 'next/server';
import { z } from 'zod';

import { authConfig } from '@/app/config/auth';
import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import type { MiniAppAuthResponse } from '@/app/types/telegram';

/**
 * Exchange Telegram's signed `initData` for a session cookie.
 *
 * The Mini App runs in Telegram's WebView on *our* origin, so the browser can
 * reach this handler but not the Laravel API (the JWT lives in an httpOnly
 * cookie that is never exposed to client JS). This handler is the bridge:
 *
 *   client → POST initData here → Laravel verifies HMAC → JWT → httpOnly cookie
 *
 * After a 200, server components can call `getCurrentUser()` exactly as the
 * dashboard does — the Mini App reuses the entire existing data layer.
 *
 * `initData` is forwarded verbatim: the signature covers the exact byte
 * sequence, so any normalisation here would invalidate it.
 */

const BodySchema = z.object({
	init_data: z.string().min(1).max(4096),
});

export async function POST(request: Request): Promise<Response> {
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return NextResponse.json(
			{ message: 'Malformed request body.' },
			{ status: 400 },
		);
	}

	const parsed = BodySchema.safeParse(raw);
	if (!parsed.success) {
		return NextResponse.json(
			{ message: 'Telegram launch data is missing.' },
			{ status: 400 },
		);
	}

	// `token: null` — this call mints the first token, so it must not attach a
	// stale cookie from a previous session.
	const res = await api.post<MiniAppAuthResponse>(
		endpoints.auth.telegramMiniApp,
		{ init_data: parsed.data.init_data },
		{ token: null },
	);

	if (!res.ok || !res.data?.token) {
		// Mirror the backend's deliberately generic failure — never leak whether
		// the signature, the freshness check, or user resolution was at fault.
		return NextResponse.json(
			{ message: 'Could not verify your Telegram session.' },
			{ status: res.status === 0 ? 502 : res.status },
		);
	}

	const response = NextResponse.json({ ok: true });

	/**
	 * Telegram renders the Mini App in an embedded WebView (and an iframe on
	 * desktop), which browsers treat as a third-party context. A `SameSite=Lax`
	 * cookie is silently dropped there, so the session would be set and then
	 * never sent back — the app authenticates, then renders as a guest.
	 *
	 * `SameSite=None` fixes it, but browsers only accept it together with
	 * `Secure`, which in turn requires HTTPS. Over plain HTTP (local dev
	 * without a tunnel) we fall back to `Lax`, which is fine because that is a
	 * first-party context anyway.
	 */
	const isHttps =
		new URL(request.url).protocol === 'https:' ||
		request.headers.get('x-forwarded-proto') === 'https';

	const { name, maxAge, path, httpOnly } = authConfig.cookie;

	response.cookies.set({
		name,
		value: res.data.token,
		httpOnly,
		path,
		maxAge,
		secure: isHttps,
		sameSite: isHttps ? 'none' : 'lax',
	});

	return response;
}
