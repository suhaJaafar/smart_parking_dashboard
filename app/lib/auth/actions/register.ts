'use server';

import { redirect } from 'next/navigation';

import { authConfig } from '@/app/config/auth';
import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import { setSessionToken } from '@/app/lib/auth/session';
import { registerSchema } from '@/app/lib/auth/schemas';
import { REGISTER_FIELDS, type RegisterFormState } from '@/app/lib/auth/forms';
import { apiFailure, readFormValues, validationFailure } from '@/app/lib/forms';
import type { RegisterPayload, RegisterResponse } from '@/app/types/auth';

export async function registerAction(
	_prev: RegisterFormState | undefined,
	formData: FormData,
): Promise<RegisterFormState> {
	const values = readFormValues(formData, REGISTER_FIELDS);

	const parsed = registerSchema.safeParse(values);
	if (!parsed.success) {
		return validationFailure(parsed.error, { ...values, password: '' });
	}

	const payload: RegisterPayload = {
		name: parsed.data.name,
		email: parsed.data.email,
		password: parsed.data.password,
		...(parsed.data.phone_number
			? { phone_number: parsed.data.phone_number }
			: {}),
	};

	const res = await api.post<RegisterResponse>(
		endpoints.auth.register,
		payload,
		{ token: null },
	);

	if (!res.ok || !res.data?.token) {
		return apiFailure(res.error, 'Unable to register. Please try again.', {
			...values,
			password: '',
		});
	}

	await setSessionToken(res.data.token);
	redirect(authConfig.routes.home);
}
