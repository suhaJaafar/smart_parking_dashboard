import { formFields, type FormState } from '@/app/types/forms';
import type { CreateParkPayload, UpdateParkPayload } from '@/app/types/park';

/**
 * Canonical field list for the **create park** form. Used by:
 *   - the server action to read FormData,
 *   - the Zod schema to validate the same keys,
 *   - the page to render fields.
 *
 * Constrained to keys of `CreateParkPayload`: if a payload field is renamed
 * in `app/types/park.ts`, this list fails to compile until it's updated too.
 */
export const CREATE_PARK_FIELDS = formFields<CreateParkPayload>()([
	'name',
	'capacity',
	'free_spaces',
	'user_id',
	'country',
	'state',
	'city',
	'postal_code',
	'latitude',
	'longitude',
	'extra_details',
]);

export type CreateParkFormValues = Record<
	(typeof CREATE_PARK_FIELDS)[number],
	string
>;
export type CreateParkFormState = FormState<CreateParkFormValues>;

/** Canonical field list for the **update park** form (location is immutable). */
export const UPDATE_PARK_FIELDS = formFields<UpdateParkPayload>()([
	'name',
	'capacity',
	'free_spaces',
]);

export type UpdateParkFormValues = Record<
	(typeof UPDATE_PARK_FIELDS)[number],
	string
>;
export type UpdateParkFormState = FormState<UpdateParkFormValues>;
