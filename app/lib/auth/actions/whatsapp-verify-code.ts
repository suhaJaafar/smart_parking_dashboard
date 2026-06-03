'use server';

import { redirect } from 'next/navigation';

import { authConfig } from '@/app/config/auth';
import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import { setSessionToken } from '@/app/lib/auth/session';
import { whatsappVerifyCodeSchema } from '@/app/lib/auth/schemas';
import {
	WHATSAPP_VERIFY_CODE_FIELDS,
	type WhatsappVerifyCodeFormState,
} from '@/app/lib/auth/forms';
import { apiFailure, readFormValues, validationFailure } from '@/app/lib/forms';
import type { WhatsappVerifyCodeResponse } from '@/app/types/auth';

/**
 * Step 2 of WhatsApp OTP login: submit the code and exchange it for a JWT.
 * On success we store the token in the session cookie and redirect to the
 * dashboard, exactly like `loginAction` — so downstream code (DAL,
 * server-client, role gates) needs zero changes.
 */
export async function whatsappVerifyCodeAction(
	_prev: WhatsappVerifyCodeFormState | undefined,
	formData: FormData,
): Promise<WhatsappVerifyCodeFormState> {
	const values = readFormValues(formData, WHATSAPP_VERIFY_CODE_FIELDS);

	const parsed = whatsappVerifyCodeSchema.safeParse(values);
	if (!parsed.success) {
		return validationFailure(parsed.error, values);
	}

	const res = await api.post<WhatsappVerifyCodeResponse>(
		endpoints.auth.whatsappVerifyCode,
		{
			phone_number: parsed.data.phone_number,
			code: parsed.data.code,
		},
		{ token: null },
	);

	if (!res.ok || !res.data?.token) {
		return apiFailure(res.error, 'Invalid or expired code. Please try again.', {
			...values,
			code: '',
		});
	}

	await setSessionToken(res.data.token);
	redirect(authConfig.routes.home);
}
