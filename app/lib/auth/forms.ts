import type { FormState } from '@/app/types/forms';

export const LOGIN_FIELDS = ['email', 'password'] as const;
export type LoginFormValues = Record<(typeof LOGIN_FIELDS)[number], string>;
export type LoginFormState = FormState<LoginFormValues>;

export const REGISTER_FIELDS = [
	'name',
	'email',
	'password',
	'phone_number',
] as const;
export type RegisterFormValues = Record<
	(typeof REGISTER_FIELDS)[number],
	string
>;
export type RegisterFormState = FormState<RegisterFormValues>;

export const WHATSAPP_REQUEST_CODE_FIELDS = ['phone_number'] as const;
export type WhatsappRequestCodeFormValues = Record<
	(typeof WHATSAPP_REQUEST_CODE_FIELDS)[number],
	string
>;
export type WhatsappRequestCodeFormState =
	FormState<WhatsappRequestCodeFormValues> & {
		/** Set to true after a successful send so the UI advances to step 2. */
		codeSent?: boolean;
	};

export const WHATSAPP_VERIFY_CODE_FIELDS = ['phone_number', 'code'] as const;
export type WhatsappVerifyCodeFormValues = Record<
	(typeof WHATSAPP_VERIFY_CODE_FIELDS)[number],
	string
>;
export type WhatsappVerifyCodeFormState =
	FormState<WhatsappVerifyCodeFormValues>;

export const TELEGRAM_VERIFY_CODE_FIELDS = ['code'] as const;
export type TelegramVerifyCodeFormValues = Record<
	(typeof TELEGRAM_VERIFY_CODE_FIELDS)[number],
	string
>;
export type TelegramVerifyCodeFormState =
	FormState<TelegramVerifyCodeFormValues>;
