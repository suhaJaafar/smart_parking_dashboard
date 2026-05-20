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
import { createUser } from '@/app/lib/users/api';
import {
	CREATE_USER_FIELDS,
	type CreateUserFormState,
} from '@/app/lib/users/forms';
import { canManageUsers } from '@/app/lib/users/permissions';
import { createUserSchema } from '@/app/lib/users/schemas';

export async function createUserAction(
	_prev: CreateUserFormState | undefined,
	formData: FormData,
): Promise<CreateUserFormState> {
	const user = await requireAuth();
	if (!canManageUsers(user)) {
		return formError('You are not allowed to create users.');
	}

	const values = readFormValues(formData, CREATE_USER_FIELDS);
	const parsed = createUserSchema.safeParse(values);
	if (!parsed.success) return validationFailure(parsed.error, values);

	const res = await createUser(parsed.data);
	if (!res.ok) return apiFailure(res.error, 'Failed to create user.', values);

	revalidatePath('/dashboard/users');
	redirect('/dashboard/users');
}
