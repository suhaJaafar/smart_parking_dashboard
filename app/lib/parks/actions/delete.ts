'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { deletePark, getPark } from '@/app/lib/parks/api';
import { canManagePark } from '@/app/lib/parks/permissions';

/**
 * Form-friendly delete action. Bind the id with `.bind(null, id)` from a
 * Server Component, then post a form to invoke it.
 *
 * Always redirects — on success to the list, on failure back to the detail
 * with an `?error=` query so the UI can render a message without needing
 * full action state.
 */
export async function deleteParkAction(
	id: string,
	_formData: FormData,
): Promise<void> {
	const user = await requireAuth();

	const current = await getPark(id);
	if (!current.ok) {
		redirect(`/dashboard/parkings?error=not_found`);
	}
	if (!canManagePark(user, current.data.data)) {
		redirect(`/dashboard/parkings/${id}?error=forbidden`);
	}

	const res = await deletePark(id);
	if (!res.ok && res.status !== 204) {
		redirect(`/dashboard/parkings/${id}?error=delete_failed`);
	}

	revalidatePath('/dashboard/parkings');
	redirect('/dashboard/parkings');
}
