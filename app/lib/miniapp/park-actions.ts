'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAuth } from '@/app/lib/auth/dal';
import { createPark } from '@/app/lib/parks/api';
import { Country } from '@/app/types/country';
import { State } from '@/app/types/state';
import type { ActionResult } from '@/app/types/miniapp';
import type { Park } from '@/app/types/park';

/**
 * Register a new garage from the Mini App.
 *
 * Reuses `POST /api/parks`, the same endpoint the dashboard uses, so a park
 * created here is indistinguishable from one created anywhere else — and the
 * backend still promotes the creator to SPACE_OWNER.
 */

const CreateParkSchema = z.object({
	name: z.string().trim().min(1).max(255),
	capacity: z.number().int().min(1).max(10_000),
	price: z.number().min(0).max(1_000_000).optional(),
	state: z.number().int(),
	city: z.string().trim().max(255).optional(),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
});

export async function createParkAction(
	input: unknown,
): Promise<ActionResult<Park>> {
	await requireAuth();

	const parsed = CreateParkSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: 'invalid_request' };
	}

	const { name, capacity, price, state, city, latitude, longitude } =
		parsed.data;

	const res = await createPark({
		name,
		capacity,
		...(price !== undefined ? { price } : {}),
		// Single-country product for now; the enum exists for future markets.
		country: Country.IRAQ,
		state: state as State,
		...(city ? { city } : {}),
		latitude,
		longitude,
	});

	if (!res.ok) {
		return {
			ok: false,
			error: res.status === 422 ? 'invalid_request' : 'request_failed',
		};
	}

	// The garages list and the owner home both count parks.
	revalidatePath('/miniapp/garages');
	revalidatePath('/miniapp');

	return { ok: true, data: res.data.data };
}
