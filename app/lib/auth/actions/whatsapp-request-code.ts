'use server';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import { whatsappRequestCodeSchema } from '@/app/lib/auth/schemas';
import {
	WHATSAPP_REQUEST_CODE_FIELDS,
	type WhatsappRequestCodeFormState,
} from '@/app/lib/auth/forms';
import { apiFailure, readFormValues, validationFailure } from '@/app/lib/forms';
import type { WhatsappRequestCodeResponse } from '@/app/types/auth';

/**
 * Step 1 of WhatsApp OTP login: ask the backend to send a code.
 *
 * The backend response is intentionally identical regardless of whether the
 * phone is registered (anti-enumeration). We mirror that here: any 2xx flips
 * `codeSent` to true so the page advances to the code-entry step, even when
 * the user typed a number that has no account. They'll only fail at verify.
 */
export async function whatsappRequestCodeAction(
	_prev: WhatsappRequestCodeFormState | undefined,
	formData: FormData,
): Promise<WhatsappRequestCodeFormState> {
	const values = readFormValues(formData, WHATSAPP_REQUEST_CODE_FIELDS);

	const parsed = whatsappRequestCodeSchema.safeParse(values);
	if (!parsed.success) {
		return validationFailure(parsed.error, values);
	}

	const res = await api.post<WhatsappRequestCodeResponse>(
		endpoints.auth.whatsappRequestCode,
		{ phone_number: parsed.data.phone_number },
		{ token: null },
	);

	if (!res.ok) {
		return apiFailure(
			res.error,
			'Unable to send the code right now. Please try again.',
			values,
		);
	}

	return { ok: true, values, codeSent: true };
}
