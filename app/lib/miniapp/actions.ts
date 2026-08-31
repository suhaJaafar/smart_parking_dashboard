'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/app/lib/auth/dal';
import {
	cancelReservation,
	createReservation,
	listNearbyParks,
	listReservationHistory,
} from '@/app/lib/miniapp/api';
import type {
	ActionResult,
	CustomerReservation,
	NearbyPark,
	ReservationHistoryPage,
} from '@/app/types/miniapp';
import type { ApiErrorBody } from '@/app/types/api';

/**
 * Server Actions for the Mini App.
 *
 * Unlike the dashboard actions these *return* a result instead of redirecting:
 * the Mini App updates in place, and a full navigation on every tap would
 * break the native feel. Errors come back as short codes the client maps to
 * copy, so no backend wording leaks into the UI.
 */

const CoordsSchema = z.object({
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
});

const ReserveSchema = z.object({
	parkId: z.string().uuid(),
	scheduledAt: z.string().datetime().optional(),
});

const HistorySchema = z.object({
	filter: z.enum(['all', 'completed', 'unpaid', 'cancelled']),
	page: z.number().int().min(1).max(500),
});

/** Map an HTTP status onto a stable client-facing error code. */
function errorCodeFor(status: number): string {
	if (status === 401) return 'unauthenticated';
	if (status === 403) return 'forbidden';
	if (status === 404) return 'not_found';
	if (status === 422) return 'unavailable';
	if (status === 429) return 'rate_limited';
	return 'request_failed';
}

/**
 * Pull the real reason out of a failed reservation.
 *
 * A 422 alone cannot distinguish "this garage just filled up" from "your car
 * is still inside another garage" — Laravel encodes that in the validation
 * *key*, and the message shown to the driver is only useful if it survives.
 * Collapsing them all onto `unavailable` told people a garage with 20 free
 * spaces was full.
 */
function reservationFailure(res: {
	status: number;
	error: ApiErrorBody | null;
}): { ok: false; error: string; detail?: string } {
	const errors = res.error?.errors;

	if (res.status === 422 && errors) {
		// The backend puts the blocking garage's name in the message body.
		if (errors.car_inside_elsewhere?.[0]) {
			return {
				ok: false,
				error: 'car_inside_elsewhere',
				detail: errors.car_inside_elsewhere[0],
			};
		}
		if (errors.hold_elsewhere?.[0]) {
			return {
				ok: false,
				error: 'hold_elsewhere',
				detail: errors.hold_elsewhere[0],
			};
		}
		if (errors.park_unavailable) {
			return { ok: false, error: 'park_unavailable' };
		}
		if (errors.park_id) {
			return { ok: false, error: 'unavailable' };
		}
	}

	return { ok: false, error: errorCodeFor(res.status) };
}

export async function findNearbyParksAction(
	coords: unknown,
): Promise<ActionResult<NearbyPark[]>> {
	await requireAuth();

	const parsed = CoordsSchema.safeParse(coords);
	if (!parsed.success) {
		return { ok: false, error: 'invalid_location' };
	}

	const res = await listNearbyParks(parsed.data);
	if (!res.ok) {
		return { ok: false, error: errorCodeFor(res.status) };
	}

	return { ok: true, data: res.data.data ?? [] };
}

/** Re-query the log after a filter change, or append the next page. */
export async function loadHistoryAction(
	input: unknown,
): Promise<ActionResult<ReservationHistoryPage>> {
	await requireAuth();

	const parsed = HistorySchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: 'invalid_request' };
	}

	const res = await listReservationHistory(parsed.data);
	if (!res.ok) {
		return { ok: false, error: errorCodeFor(res.status) };
	}

	return { ok: true, data: res.data };
}

export async function reserveParkAction(
	input: unknown,
): Promise<ActionResult<CustomerReservation>> {
	await requireAuth();

	const parsed = ReserveSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: 'invalid_request' };
	}

	const res = await createReservation({
		park_id: parsed.data.parkId,
		...(parsed.data.scheduledAt
			? { scheduled_at: parsed.data.scheduledAt }
			: {}),
	});

	if (!res.ok) {
		return reservationFailure(res);
	}

	// Invalidate here rather than calling `router.refresh()` on the client: the
	// client sits inside a transition, and a second round trip would keep
	// Telegram's MainButton spinner alive after the booking is already made.
	revalidatePath('/miniapp');
	revalidatePath('/miniapp/booking');

	return { ok: true, data: res.data.data };
}

export async function cancelReservationAction(
	id: unknown,
): Promise<ActionResult<CustomerReservation>> {
	await requireAuth();

	const parsed = z.string().uuid().safeParse(id);
	if (!parsed.success) {
		return { ok: false, error: 'invalid_request' };
	}

	const res = await cancelReservation(parsed.data);
	if (!res.ok) {
		return { ok: false, error: errorCodeFor(res.status) };
	}

	revalidatePath('/miniapp');
	revalidatePath('/miniapp/booking');

	return { ok: true, data: res.data.data };
}
