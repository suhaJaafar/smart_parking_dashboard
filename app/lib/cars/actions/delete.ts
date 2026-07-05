'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { deleteOwnerCar } from '@/app/lib/cars/api';
import { canManageOwnerCars } from '@/app/lib/cars/permissions';

const LIST_PATH = '/dashboard/cars';

/**
 * Form-friendly delete action. Bind the id with `.bind(null, id)` from a
 * Server Component, then post a form to invoke it.
 *
 * Deleting frees the car's slot on the backend before removing the record.
 * Always redirects back to the list — with an `?error=` query on failure so
 * the UI can render a banner without full action state.
 */
export async function deleteOwnerCarAction(
	id: string,
	_formData: FormData,
): Promise<void> {
	const user = await requireAuth();
	if (!canManageOwnerCars(user)) {
		redirect(`${LIST_PATH}?error=forbidden`);
	}

	const res = await deleteOwnerCar(id);
	if (!res.ok && res.status !== 204) {
		const code = res.status === 404 ? 'not_found' : 'delete_failed';
		redirect(`${LIST_PATH}?error=${code}`);
	}

	revalidatePath(LIST_PATH);
	redirect(`${LIST_PATH}?ok=deleted`);
}
