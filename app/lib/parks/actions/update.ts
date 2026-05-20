'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import {
	apiFailure,
	formError,
	readFormValues,
	validationFailure,
} from '@/app/lib/forms';
import { getPark, updatePark } from '@/app/lib/parks/api';
import {
	UPDATE_PARK_FIELDS,
	type UpdateParkFormState,
} from '@/app/lib/parks/forms';
import { canManagePark } from '@/app/lib/parks/permissions';
import { updateParkSchema } from '@/app/lib/parks/schemas';

export async function updateParkAction(
	id: string,
	_prev: UpdateParkFormState | undefined,
	formData: FormData,
): Promise<UpdateParkFormState> {
	const user = await requireAuth();

	// Authorize against the live record — never trust the form.
	const current = await getPark(id);
	if (!current.ok) {
		return formError(current.error?.message ?? 'Park not found.');
	}
	if (!canManagePark(user, current.data.data)) {
		return formError('You are not allowed to edit this park.');
	}

	const values = readFormValues(formData, UPDATE_PARK_FIELDS);
	const parsed = updateParkSchema.safeParse(values);
	if (!parsed.success) return validationFailure(parsed.error, values);

	const res = await updatePark(id, parsed.data);
	if (!res.ok) return apiFailure(res.error, 'Failed to update park.', values);

	revalidatePath('/dashboard/parkings');
	revalidatePath(`/dashboard/parkings/${id}`);
	redirect(`/dashboard/parkings/${id}`);
}
