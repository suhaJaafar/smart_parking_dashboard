'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { approvePark, rejectPark } from '@/app/lib/park-approvals/api';
import { canReviewParks } from '@/app/lib/park-approvals/permissions';

const LIST_PATH = '/dashboard/park-approvals';

/**
 * Form-friendly approve/reject actions for the garage review queue.
 *
 * Bind the id with `.bind(null, id)` from a Server Component, then post a form
 * to invoke them — the same shape the co-owner request actions use, so the
 * privileged surfaces behave identically.
 *
 * Approving flips the garage live, grants its owner the SPACE_OWNER role and
 * pushes a Telegram confirmation. Both always redirect back to the list, with
 * an `?error=` query on failure so the page can render a banner.
 */
export async function approveParkAction(
	id: string,
	_formData: FormData,
): Promise<void> {
	const actor = await requireAuth();
	if (!canReviewParks(actor)) {
		redirect(`${LIST_PATH}?error=forbidden`);
	}

	const res = await approvePark(id);
	if (!res.ok) {
		redirect(
			`${LIST_PATH}?error=${res.status === 404 ? 'not_found' : 'approve_failed'}`,
		);
	}

	revalidatePath(LIST_PATH);
	redirect(`${LIST_PATH}?ok=approved`);
}

export async function rejectParkAction(
	id: string,
	formData: FormData,
): Promise<void> {
	const actor = await requireAuth();
	if (!canReviewParks(actor)) {
		redirect(`${LIST_PATH}?error=forbidden`);
	}

	// Relayed to the owner verbatim, so an empty box must stay undefined
	// rather than sending them a blank "reason".
	const raw = formData.get('reason');
	const reason =
		typeof raw === 'string' && raw.trim().length > 0
			? raw.trim().slice(0, 500)
			: undefined;

	const res = await rejectPark(id, reason);
	if (!res.ok) {
		redirect(
			`${LIST_PATH}?error=${res.status === 404 ? 'not_found' : 'reject_failed'}`,
		);
	}

	revalidatePath(LIST_PATH);
	redirect(`${LIST_PATH}?ok=rejected`);
}
