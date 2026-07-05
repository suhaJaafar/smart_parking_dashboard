import { z } from 'zod';

import type {
	CreateOwnerCarPayload,
	UpdateOwnerCarPayload,
} from '@/app/types/car';

/* ------------------------------------------------------------------ */
/*  Reusable atoms                                                     */
/* ------------------------------------------------------------------ */

const platePrefix = z
	.string()
	.trim()
	.min(1, 'Plate prefix is required.')
	.max(8, 'Plate prefix cannot exceed 8 characters.');

const carNumber = z
	.string()
	.trim()
	.min(1, 'Car number is required.')
	.max(20, 'Car number cannot exceed 20 characters.');

/** Empty-or-missing → `undefined`, trimmed and length-capped. */
const optionalModel = z
	.string()
	.trim()
	.max(50, 'Model cannot exceed 50 characters.')
	.transform((v) => (v === '' ? undefined : v))
	.optional();

/* ------------------------------------------------------------------ */
/*  Create — outputs `CreateOwnerCarPayload` directly.                */
/* ------------------------------------------------------------------ */

export const createOwnerCarSchema = z
	.object({
		park_id: z.uuid('Select a garage.'),
		plate_prefix: platePrefix,
		car_number: carNumber,
		model: optionalModel,
	})
	.transform<CreateOwnerCarPayload>((v) => ({
		park_id: v.park_id,
		plate_prefix: v.plate_prefix,
		car_number: v.car_number,
		...(v.model !== undefined ? { model: v.model } : {}),
	}));

/* ------------------------------------------------------------------ */
/*  Update — outputs `UpdateOwnerCarPayload`; park moves excluded.     */
/* ------------------------------------------------------------------ */

export const updateOwnerCarSchema = z
	.object({
		plate_prefix: z
			.union([platePrefix, z.literal('').transform(() => undefined)])
			.optional(),
		car_number: z
			.union([carNumber, z.literal('').transform(() => undefined)])
			.optional(),
		model: optionalModel,
	})
	.transform<UpdateOwnerCarPayload>((v) => ({
		...(v.plate_prefix !== undefined ? { plate_prefix: v.plate_prefix } : {}),
		...(v.car_number !== undefined ? { car_number: v.car_number } : {}),
		...(v.model !== undefined ? { model: v.model } : {}),
	}));
