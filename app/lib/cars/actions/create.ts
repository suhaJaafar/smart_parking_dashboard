'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { createOwnerCar } from '@/app/lib/cars/api';
import {
	CREATE_OWNER_CAR_FIELDS,
	type CreateOwnerCarFormState,
} from '@/app/lib/cars/forms';
import { canManageOwnerCars } from '@/app/lib/cars/permissions';
import { createOwnerCarSchema } from '@/app/lib/cars/schemas';
import {
	apiFailure,
	formError,
	readFormValues,
	validationFailure,
} from '@/app/lib/forms';

const LIST_PATH = '/dashboard/cars';

export async function createOwnerCarAction(
	_prev: CreateOwnerCarFormState | undefined,
	formData: FormData,
): Promise<CreateOwnerCarFormState> {
	const user = await requireAuth();
	if (!canManageOwnerCars(user)) {
		return formError('You are not allowed to add cars.');
	}

	const values = readFormValues(formData, CREATE_OWNER_CAR_FIELDS);
	const parsed = createOwnerCarSchema.safeParse(values);
	if (!parsed.success) return validationFailure(parsed.error, values);

	const res = await createOwnerCar(parsed.data);
	if (!res.ok) return apiFailure(res.error, 'Failed to add the car.', values);

	revalidatePath(LIST_PATH);
	redirect(LIST_PATH);
}
