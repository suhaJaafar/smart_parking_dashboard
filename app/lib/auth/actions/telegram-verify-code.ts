'use server';

import { redirect } from 'next/navigation';

import { authConfig } from '@/app/config/auth';
import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import { setSessionToken } from '@/app/lib/auth/session';
import { telegramVerifyCodeSchema } from '@/app/lib/auth/schemas';
import {
	TELEGRAM_VERIFY_CODE_FIELDS,
	type TelegramVerifyCodeFormState,
} from '@/app/lib/auth/forms';
import { apiFailure, readFormValues, validationFailure } from '@/app/lib/forms';
import type { TelegramVerifyCodeResponse } from '@/app/types/auth';

/**
 * Telegram OTP login: submit the code the user got from the Telegram bot and
 * exchange it for a JWT. The code is issued bot-side (the owner taps "login to
 * dashboard"), so unlike the WhatsApp flow there is no phone-number step — the
 * backend maps the code back to the chat_id itself.
 *
 * On success we store the token in the session cookie and redirect to the
 * dashboard, exactly like `loginAction` — so the DAL, server-client and role
 * gates need zero changes.
 */
export async function telegramVerifyCodeAction(
	_prev: TelegramVerifyCodeFormState | undefined,
	formData: FormData,
): Promise<TelegramVerifyCodeFormState> {
	const values = readFormValues(formData, TELEGRAM_VERIFY_CODE_FIELDS);

	const parsed = telegramVerifyCodeSchema.safeParse(values);
	if (!parsed.success) {
		return validationFailure(parsed.error, values);
	}

	const res = await api.post<TelegramVerifyCodeResponse>(
		endpoints.auth.telegramVerifyCode,
		{ code: parsed.data.code },
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
