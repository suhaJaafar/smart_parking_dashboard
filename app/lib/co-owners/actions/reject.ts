'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { rejectCoOwnerRequest } from '@/app/lib/co-owners/api';
import { canManageCoOwners } from '@/app/lib/co-owners/permissions';

const LIST_PATH = '/dashboard/co-owners';

/**
 * Form-friendly reject action. Bind the id with `.bind(null, id)` from a
 * Server Component, then post a form to invoke it.
 *
 * Rejecting closes the request and sends a polite decline to the requester's
 * bot. Always redirects back to the list — with an `?error=` query on failure.
 */
export async function rejectCoOwnerAction(
	id: string,
	_formData: FormData,
): Promise<void> {
	const actor = await requireAuth();
	if (!canManageCoOwners(actor)) {
		redirect(`${LIST_PATH}?error=forbidden`);
	}

	const res = await rejectCoOwnerRequest(id);
	if (!res.ok) {
		const code = res.status === 404 ? 'not_found' : 'reject_failed';
		redirect(`${LIST_PATH}?error=${code}`);
	}

	revalidatePath(LIST_PATH);
	redirect(`${LIST_PATH}?ok=rejected`);
}
