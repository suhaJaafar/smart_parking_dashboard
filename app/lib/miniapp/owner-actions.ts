'use server';

import { z } from 'zod';

import { requireAuth } from '@/app/lib/auth/dal';
import {
	admitOwnerReservation,
	cancelOwnerReservation,
	exitOwnerReservation,
	listOwnerReservations,
} from '@/app/lib/reservations/api';
import { canManageOwnerReservations } from '@/app/lib/reservations/permissions';
import type { ActionResult } from '@/app/types/miniapp';
import type {
	OwnerReservation,
	ReservationFilter,
} from '@/app/types/reservation';

/**
 * Owner-side Server Actions for the Mini App.
 *
 * Like the customer actions these return a result rather than redirecting, so
 * the screen updates in place. Every action re-checks the caller's role: the
 * backend enforces it too, but failing here avoids a pointless round trip and
 * keeps the rule visible at the call site.
 */

const FilterSchema = z.enum([
	'live',
	'waiting',
	'active',
	'history',
	'all',
]) satisfies z.ZodType<ReservationFilter>;

const PlateSchema = z
	.object({
		plate_prefix: z.string().min(1).max(8),
		car_number: z.string().min(1).max(20),
	})
	.optional();

function errorCodeFor(status: number): string {
	if (status === 401) return 'unauthenticated';
	if (status === 403) return 'forbidden';
	if (status === 404) return 'not_found';
	if (status === 422) return 'invalid_state';
	return 'request_failed';
}

/**
 * Prefer the backend's specific reason over a generic status mapping.
 *
 * `admit` re-keys its validation errors so the field name *is* the code
 * (`car_in_other_park`, `park_full`, …). Falling back to a bare
 * "something changed" message would hide the one thing the owner needs to
 * know in order to act.
 */
function detailedErrorCode(
	status: number,
	body: { errors?: Record<string, string[]> } | null,
): string {
	const key = body?.errors ? Object.keys(body.errors)[0] : undefined;
	return key && key !== 'admit' ? key : errorCodeFor(status);
}

export async function listOwnerReservationsAction(
	filter: unknown,
	parkId?: unknown,
): Promise<ActionResult<OwnerReservation[]>> {
	const user = await requireAuth();
	if (!canManageOwnerReservations(user)) {
		return { ok: false, error: 'forbidden' };
	}

	const parsed = FilterSchema.safeParse(filter);
	const park = z.string().uuid().safeParse(parkId);

	const res = await listOwnerReservations({
		filter: parsed.success ? parsed.data : 'live',
		...(park.success ? { parkId: park.data } : {}),
	});

	if (!res.ok) {
		return { ok: false, error: errorCodeFor(res.status) };
	}

	return { ok: true, data: res.data.data ?? [] };
}

export async function admitReservationAction(
	id: unknown,
	plate?: unknown,
): Promise<ActionResult<OwnerReservation>> {
	const user = await requireAuth();
	if (!canManageOwnerReservations(user)) {
		return { ok: false, error: 'forbidden' };
	}

	const parsedId = z.string().uuid().safeParse(id);
	const parsedPlate = PlateSchema.safeParse(plate ?? undefined);
	if (!parsedId.success || !parsedPlate.success) {
		return { ok: false, error: 'invalid_request' };
	}

	const res = await admitOwnerReservation(parsedId.data, parsedPlate.data);
	if (!res.ok) {
		return { ok: false, error: detailedErrorCode(res.status, res.error) };
	}

	return { ok: true, data: res.data.data };
}

export async function exitReservationAction(
	id: unknown,
): Promise<ActionResult<OwnerReservation>> {
	const user = await requireAuth();
	if (!canManageOwnerReservations(user)) {
		return { ok: false, error: 'forbidden' };
	}

	const parsed = z.string().uuid().safeParse(id);
	if (!parsed.success) {
		return { ok: false, error: 'invalid_request' };
	}

	const res = await exitOwnerReservation(parsed.data);
	if (!res.ok) {
		return { ok: false, error: errorCodeFor(res.status) };
	}

	return { ok: true, data: res.data.data };
}

export async function cancelHoldAction(
	id: unknown,
): Promise<ActionResult<OwnerReservation>> {
	const user = await requireAuth();
	if (!canManageOwnerReservations(user)) {
		return { ok: false, error: 'forbidden' };
	}

	const parsed = z.string().uuid().safeParse(id);
	if (!parsed.success) {
		return { ok: false, error: 'invalid_request' };
	}

	const res = await cancelOwnerReservation(parsed.data);
	if (!res.ok) {
		return { ok: false, error: errorCodeFor(res.status) };
	}

	return { ok: true, data: res.data.data };
}
