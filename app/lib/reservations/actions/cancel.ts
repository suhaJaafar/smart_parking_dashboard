'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { cancelOwnerReservation } from '@/app/lib/reservations/api';
import { canManageOwnerReservations } from '@/app/lib/reservations/permissions';
import { safeRedirectTarget } from '@/app/lib/reservations/redirect';

const LIST_PATH = '/dashboard/reservations';

/**
 * Server Action: cancel a still-waiting reservation.
 *
 * Bind the id with `.bind(null, id)` from a Server Component, then submit a
 * form to invoke it. On the backend this calls `ReservationService::cancel`
 * — the same code path the bot uses when a customer aborts a hold — so the
 * status flips to CANCELLED and the customer is notified. No slot is freed
 * because no car ever entered.
 *
 * The action always redirects back to a caller-supplied path (defaults to
 * the reservations list). The path is validated by {@link safeRedirectTarget}
 * so a tampered hidden `redirectTo` field can never send the user off-site.
 */
export async function cancelReservationAction(
	id: string,
	formData: FormData,
): Promise<void> {
	const user = await requireAuth();
	const redirectTo = safeRedirectTarget(formData.get('redirectTo'), LIST_PATH);

	if (!canManageOwnerReservations(user)) {
		redirect(`${redirectTo}?error=forbidden`);
	}

	const res = await cancelOwnerReservation(id);
	if (!res.ok) {
		const code =
			res.status === 404
				? 'not_found'
				: res.status === 422
					? 'invalid_state'
					: 'cancel_failed';
		redirect(`${redirectTo}?error=${code}`);
	}

	revalidatePath(LIST_PATH);
	revalidatePath(redirectTo);
	redirect(`${redirectTo}?ok=cancelled`);
}
