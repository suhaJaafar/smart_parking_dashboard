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
