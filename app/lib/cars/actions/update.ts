'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { getOwnerCar, updateOwnerCar } from '@/app/lib/cars/api';
import {
	UPDATE_OWNER_CAR_FIELDS,
	type UpdateOwnerCarFormState,
} from '@/app/lib/cars/forms';
import { canManageOwnerCars } from '@/app/lib/cars/permissions';
import { updateOwnerCarSchema } from '@/app/lib/cars/schemas';
import {
	apiFailure,
	formError,
	readFormValues,
	validationFailure,
} from '@/app/lib/forms';

const LIST_PATH = '/dashboard/cars';

export async function updateOwnerCarAction(
	id: string,
	_prev: UpdateOwnerCarFormState | undefined,
	formData: FormData,
): Promise<UpdateOwnerCarFormState> {
	const user = await requireAuth();
	if (!canManageOwnerCars(user)) {
		return formError('You are not allowed to edit this car.');
	}

	// Authorize against the live record — the backend scopes to owned parks
	// and returns 404 for anything outside them.
	const current = await getOwnerCar(id);
	if (!current.ok) {
		return formError(current.error?.message ?? 'Car not found.');
	}

	const values = readFormValues(formData, UPDATE_OWNER_CAR_FIELDS);
	const parsed = updateOwnerCarSchema.safeParse(values);
	if (!parsed.success) return validationFailure(parsed.error, values);

	const res = await updateOwnerCar(id, parsed.data);
	if (!res.ok)
		return apiFailure(res.error, 'Failed to update the car.', values);

	revalidatePath(LIST_PATH);
	redirect(LIST_PATH);
}
