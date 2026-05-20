'use server';

import { redirect } from 'next/navigation';

import { authConfig } from '@/app/config/auth';
import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import { setSessionToken } from '@/app/lib/auth/session';
import { loginSchema } from '@/app/lib/auth/schemas';
import { LOGIN_FIELDS, type LoginFormState } from '@/app/lib/auth/forms';
import { apiFailure, readFormValues, validationFailure } from '@/app/lib/forms';
import type { LoginResponse } from '@/app/types/auth';

export async function loginAction(
	_prev: LoginFormState | undefined,
	formData: FormData,
): Promise<LoginFormState> {
	const values = readFormValues(formData, LOGIN_FIELDS);

	const parsed = loginSchema.safeParse(values);
	if (!parsed.success) {
		// Don't echo back the password.
		return validationFailure(parsed.error, { ...values, password: '' });
	}

	const res = await api.post<LoginResponse>(endpoints.auth.login, parsed.data, {
		token: null, // never send a stale token on login
	});

	if (!res.ok || !res.data?.token) {
		return apiFailure(res.error, 'Invalid credentials. Please try again.', {
			...values,
			password: '',
		});
	}

	await setSessionToken(res.data.token);
	redirect(authConfig.routes.home);
}
