'use server';

import { redirect } from 'next/navigation';

import { authConfig } from '@/app/config/auth';
import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import { clearSessionToken, getSessionToken } from '@/app/lib/auth/session';

/** Best-effort backend logout + clear local cookie + redirect to login. */
export async function logoutAction(): Promise<void> {
	const token = await getSessionToken();
	if (token) {
		try {
			await api.post(endpoints.auth.logout);
		} catch {
			// ignore — we still clear the cookie locally below
		}
	}
	await clearSessionToken();
	redirect(authConfig.routes.login);
}
