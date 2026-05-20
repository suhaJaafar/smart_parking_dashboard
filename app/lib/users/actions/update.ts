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
import { getUser, updateUser } from '@/app/lib/users/api';
import {
	UPDATE_USER_FIELDS,
	type UpdateUserFormState,
} from '@/app/lib/users/forms';
import { canManageUsers } from '@/app/lib/users/permissions';
import { updateUserSchema } from '@/app/lib/users/schemas';

export async function updateUserAction(
	id: string,
	_prev: UpdateUserFormState | undefined,
	formData: FormData,
): Promise<UpdateUserFormState> {
	const actor = await requireAuth();
	if (!canManageUsers(actor)) {
		return formError('You are not allowed to edit users.');
	}

	// Authorize against the live record — never trust the form.
	const current = await getUser(id);
	if (!current.ok) {
		return formError(current.error?.message ?? 'User not found.');
	}

	const values = readFormValues(formData, UPDATE_USER_FIELDS);
	const parsed = updateUserSchema.safeParse(values);
	if (!parsed.success) return validationFailure(parsed.error, values);

	const res = await updateUser(id, parsed.data);
	if (!res.ok) return apiFailure(res.error, 'Failed to update user.', values);

	revalidatePath('/dashboard/users');
	revalidatePath(`/dashboard/users/${id}`);
	redirect(`/dashboard/users/${id}`);
}
