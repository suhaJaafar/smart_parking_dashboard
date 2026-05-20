import { NextResponse, type NextRequest } from 'next/server';

import { authConfig } from '@/app/config/auth';

export function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const hasToken = Boolean(req.cookies.get(authConfig.cookie.name)?.value);

	const isProtected = pathname.startsWith('/dashboard');

	if (isProtected && !hasToken) {
		const url = req.nextUrl.clone();
		url.pathname = authConfig.routes.login;
		url.searchParams.set('next', pathname);
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/dashboard/:path*', '/auth/:path*'],
};
