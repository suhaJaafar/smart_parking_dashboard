'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { deleteUser, getUser } from '@/app/lib/users/api';
import { canDeleteUser } from '@/app/lib/users/permissions';

/**
 * Form-friendly delete action. Bind the id with `.bind(null, id)` from a
 * Server Component, then post a form to invoke it.
 *
 * Always redirects — on success to the list, on failure back to the detail
 * with an `?error=` query so the UI can render a message without needing
 * full action state.
 */
export async function deleteUserAction(
	id: string,
	_formData: FormData,
): Promise<void> {
	const actor = await requireAuth();

	const current = await getUser(id);
	if (!current.ok) {
		redirect('/dashboard/users?error=not_found');
	}
	if (!canDeleteUser(actor, current.data.data)) {
		redirect(`/dashboard/users/${id}?error=forbidden`);
	}

	const res = await deleteUser(id);
	if (!res.ok && res.status !== 204) {
		redirect(`/dashboard/users/${id}?error=delete_failed`);
	}

	revalidatePath('/dashboard/users');
	redirect('/dashboard/users');
}
