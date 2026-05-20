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
import { createPark } from '@/app/lib/parks/api';
import {
	CREATE_PARK_FIELDS,
	type CreateParkFormState,
} from '@/app/lib/parks/forms';
import { canCreatePark } from '@/app/lib/parks/permissions';
import { createParkSchema } from '@/app/lib/parks/schemas';

export async function createParkAction(
	_prev: CreateParkFormState | undefined,
	formData: FormData,
): Promise<CreateParkFormState> {
	const user = await requireAuth();
	if (!canCreatePark(user)) {
		return formError('You are not allowed to create a park.');
	}

	const values = readFormValues(formData, CREATE_PARK_FIELDS);
	const parsed = createParkSchema.safeParse(values);
	if (!parsed.success) return validationFailure(parsed.error, values);

	const res = await createPark(parsed.data);
	if (!res.ok) return apiFailure(res.error, 'Failed to create park.', values);

	revalidatePath('/dashboard/parkings');
	redirect('/dashboard/parkings');
}
