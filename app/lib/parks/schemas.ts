import { z } from 'zod';

import { Country } from '@/app/types/country';
import { State } from '@/app/types/state';
import type { CreateParkPayload, UpdateParkPayload } from '@/app/types/park';

/* ------------------------------------------------------------------ */
/*  Reusable atoms                                                     */
/* ------------------------------------------------------------------ */

/** Empty-or-missing string → `undefined`. Trims first. */
const optionalText = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.transform((v) => (v === '' ? undefined : v))
		.optional();

const capacity = z.coerce
	.number({ error: 'Capacity must be a number.' })
	.int('Capacity must be a whole number.')
	.min(1, 'Capacity must be at least 1.');

const freeSpaces = z.coerce
	.number()
	.int()
	.min(0, 'Free spaces cannot be negative.');

const latitude = z.coerce
	.number({ error: 'Latitude must be a number.' })
	.gte(-90, 'Latitude must be between -90 and 90.')
	.lte(90, 'Latitude must be between -90 and 90.');

const longitude = z.coerce
	.number({ error: 'Longitude must be a number.' })
	.gte(-180, 'Longitude must be between -180 and 180.')
	.lte(180, 'Longitude must be between -180 and 180.');

const countryEnum = z.coerce
	.number()
	.int()
	.refine((v): v is Country => v in Country, 'Invalid country.');

const stateEnum = z.coerce
	.number()
	.int()
	.refine((v): v is State => v in State, 'Invalid state.');

const freeSpacesNotExceedingCapacity = (
	v: { capacity?: number; free_spaces?: number },
	ctx: z.RefinementCtx,
) => {
	if (
		v.capacity !== undefined &&
		v.free_spaces !== undefined &&
		v.free_spaces > v.capacity
	) {
		ctx.addIssue({
			code: 'custom',
			message: 'Free spaces cannot exceed capacity.',
			path: ['free_spaces'],
		});
	}
};

/* ------------------------------------------------------------------ */
/*  Create — outputs `CreateParkPayload` directly via `.transform()`. */
/* ------------------------------------------------------------------ */

export const createParkSchema = z
	.object({
		name: z.string().trim().min(1, 'Name is required.').max(255),
		capacity,
		free_spaces: z
			.union([freeSpaces, z.literal('').transform(() => undefined)])
			.optional(),

		/**
		 * Optional owner override. The backend will *only* honour this when
		 * the actor is SUPER_ADMIN; for every other role the field is stripped
		 * before validation. We still validate the shape here so the form gets
		 * a clear client-side error on a malformed UUID.
		 */
		user_id: z
			.union([
				z.uuid('Select a valid owner.'),
				z.literal('').transform(() => undefined),
			])
			.optional(),

		country: countryEnum,
		state: stateEnum,
		city: optionalText(255),
		postal_code: optionalText(20),
		latitude,
		longitude,
		extra_details: optionalText(1000),
	})
	.superRefine(freeSpacesNotExceedingCapacity)
	.transform<CreateParkPayload>((v) => ({
		name: v.name,
		capacity: v.capacity,
		...(v.free_spaces !== undefined ? { free_spaces: v.free_spaces } : {}),
		...(v.user_id ? { user_id: v.user_id } : {}),
		country: v.country,
		state: v.state,
		latitude: v.latitude,
		longitude: v.longitude,
		...(v.city ? { city: v.city } : {}),
		...(v.postal_code ? { postal_code: v.postal_code } : {}),
		...(v.extra_details ? { extra_details: v.extra_details } : {}),
	}));

/* ------------------------------------------------------------------ */
/*  Update — outputs `UpdateParkPayload`; only mutable fields.        */
/* ------------------------------------------------------------------ */

export const updateParkSchema = z
	.object({
		name: z
			.union([
				z.string().trim().min(1, 'Name is required.').max(255),
				z.literal('').transform(() => undefined),
			])
			.optional(),
		capacity: z
			.union([capacity, z.literal('').transform(() => undefined)])
			.optional(),
		free_spaces: z
			.union([freeSpaces, z.literal('').transform(() => undefined)])
			.optional(),
	})
	.superRefine(freeSpacesNotExceedingCapacity)
	.transform<UpdateParkPayload>((v) => ({
		...(v.name !== undefined ? { name: v.name } : {}),
		...(v.capacity !== undefined ? { capacity: v.capacity } : {}),
		...(v.free_spaces !== undefined ? { free_spaces: v.free_spaces } : {}),
	}));
