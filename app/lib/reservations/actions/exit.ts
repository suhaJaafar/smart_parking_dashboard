'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/app/lib/auth/dal';
import { exitOwnerReservation } from '@/app/lib/reservations/api';
import { canManageOwnerReservations } from '@/app/lib/reservations/permissions';
import { safeRedirectTarget } from '@/app/lib/reservations/redirect';

const LIST_PATH = '/dashboard/reservations';

/**
 * Server Action: drive an ACTIVE reservation's car out of the garage.
 *
 * Bind the id with `.bind(null, id)` from a Server Component. On the backend
 * this mirrors the bot's exit flow exactly — `CarService::exitPark` releases
 * the slot and nulls `car.park_id`, then `ReservationService::markCompleted`
 * flips the reservation to COMPLETED.
 *
 * A hidden `redirectTo` field keeps the user on the same page they invoked
 * the action from (list or park detail). The value is validated by
 * {@link safeRedirectTarget} so a tampered field can never send the user
 * off-site.
 */
export async function exitReservationAction(
	id: string,
	formData: FormData,
): Promise<void> {
	const user = await requireAuth();
	const redirectTo = safeRedirectTarget(formData.get('redirectTo'), LIST_PATH);

	if (!canManageOwnerReservations(user)) {
		redirect(`${redirectTo}?error=forbidden`);
	}

	const res = await exitOwnerReservation(id);
	if (!res.ok) {
		const code =
			res.status === 404
				? 'not_found'
				: res.status === 422
					? 'invalid_state'
					: 'exit_failed';
		redirect(`${redirectTo}?error=${code}`);
	}

	revalidatePath(LIST_PATH);
	revalidatePath(redirectTo);
	redirect(`${redirectTo}?ok=exited`);
}
