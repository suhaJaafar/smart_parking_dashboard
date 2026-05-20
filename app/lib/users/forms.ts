import { formFields, type FormState } from '@/app/types/forms';
import type { CreateUserPayload, UpdateUserPayload } from '@/app/types/user';

/**
 * Canonical field list for the **create user** form. Used by:
 *   - the server action to read FormData,
 *   - the Zod schema to validate the same keys,
 *   - the page to render fields.
 */
export const CREATE_USER_FIELDS = formFields<CreateUserPayload>()([
	'name',
	'email',
	'password',
	'phone_number',
	'roles',
]);

export type CreateUserFormValues = Record<
	(typeof CREATE_USER_FIELDS)[number],
	string
>;
export type CreateUserFormState = FormState<CreateUserFormValues>;

/** Canonical field list for the **update user** form. Password is optional. */
export const UPDATE_USER_FIELDS = formFields<UpdateUserPayload>()([
	'name',
	'email',
	'password',
	'phone_number',
	'roles',
]);

export type UpdateUserFormValues = Record<
	(typeof UPDATE_USER_FIELDS)[number],
	string
>;
export type UpdateUserFormState = FormState<UpdateUserFormValues>;
