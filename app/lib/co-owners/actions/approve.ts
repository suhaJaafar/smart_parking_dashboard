'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { approveCoOwnerRequest } from '@/app/lib/co-owners/api';
import { canManageCoOwners } from '@/app/lib/co-owners/permissions';

const LIST_PATH = '/dashboard/co-owners';

/**
 * Form-friendly approve action. Bind the id with `.bind(null, id)` from a
 * Server Component, then post a form to invoke it.
 *
 * Approving links the requester's Telegram chat to the owner's account and
 * pushes a confirmation message to their bot. Always redirects back to the
 * list — with an `?error=` query on failure so the UI can render a banner.
 */
export async function approveCoOwnerAction(
	id: string,
	_formData: FormData,
): Promise<void> {
	const actor = await requireAuth();
	if (!canManageCoOwners(actor)) {
		redirect(`${LIST_PATH}?error=forbidden`);
	}

	const res = await approveCoOwnerRequest(id);
	if (!res.ok) {
		const code = res.status === 404 ? 'not_found' : 'approve_failed';
		redirect(`${LIST_PATH}?error=${code}`);
	}

	revalidatePath(LIST_PATH);
	redirect(`${LIST_PATH}?ok=approved`);
}
