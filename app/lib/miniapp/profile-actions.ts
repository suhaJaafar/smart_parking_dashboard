'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { api } from '@/app/lib/api/server-client';
import { endpoints } from '@/app/lib/api/endpoints';
import { requireAuth } from '@/app/lib/auth/dal';
import type { ActionResult } from '@/app/types/miniapp';

/**
 * Switch the signed-in account between driver and garage owner.
 *
 * Roles are exclusive on the backend (`roles()->sync()`), exactly as the bot's
 * onboarding behaves — becoming an owner detaches the driver role and vice
 * versa. The Mini App simply asks; it never decides.
 */

const InputSchema = z.object({
	role: z.enum(['owner', 'customer']),
	phone_number: z.string().max(32).optional(),
});

export async function switchRoleAction(
	input: unknown,
): Promise<ActionResult<{ role: 'owner' | 'customer' }>> {
	await requireAuth();

	const parsed = InputSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: 'invalid_request' };
	}

	const res = await api.post(endpoints.auth.switchRole, parsed.data);

	if (!res.ok) {
		// 422 means the owner path needs a usable phone number.
		return {
			ok: false,
			error: res.status === 422 ? 'phone_required' : 'request_failed',
		};
	}

	// The home screen renders a completely different face per role, so its
	// cached output must go.
	revalidatePath('/miniapp');
	revalidatePath('/miniapp/settings');

	return { ok: true, data: { role: parsed.data.role } };
}
