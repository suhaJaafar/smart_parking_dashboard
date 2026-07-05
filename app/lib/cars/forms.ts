import { formFields, type FormState } from '@/app/types/forms';
import type {
	CreateOwnerCarPayload,
	UpdateOwnerCarPayload,
} from '@/app/types/car';

/**
 * Canonical field list for the **add car** form. Shared by the server action
 * (reads FormData), the Zod schema (validates the same keys), and the form
 * component (renders the fields). Constrained to `CreateOwnerCarPayload` keys
 * so a payload rename fails to compile until this list is updated too.
 */
export const CREATE_OWNER_CAR_FIELDS = formFields<CreateOwnerCarPayload>()([
	'park_id',
	'plate_prefix',
	'car_number',
	'model',
]);

export type CreateOwnerCarFormValues = Record<
	(typeof CREATE_OWNER_CAR_FIELDS)[number],
	string
>;
export type CreateOwnerCarFormState = FormState<CreateOwnerCarFormValues>;

/** Canonical field list for the **edit car** form (park is immutable here). */
export const UPDATE_OWNER_CAR_FIELDS = formFields<UpdateOwnerCarPayload>()([
	'plate_prefix',
	'car_number',
	'model',
]);

export type UpdateOwnerCarFormValues = Record<
	(typeof UPDATE_OWNER_CAR_FIELDS)[number],
	string
>;
export type UpdateOwnerCarFormState = FormState<UpdateOwnerCarFormValues>;
