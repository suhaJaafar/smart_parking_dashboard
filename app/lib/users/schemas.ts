import { z } from 'zod';

import { RoleType } from '@/app/types/role';
import type { CreateUserPayload, UpdateUserPayload } from '@/app/types/user';

/* ------------------------------------------------------------------ */
/*  Reusable atoms                                                     */
/* ------------------------------------------------------------------ */

const name = z.string().trim().min(1, 'Name is required.').max(255);

const email = z
	.string()
	.trim()
	.toLowerCase()
	.email('Enter a valid email.')
	.max(255);

const password = z
	.string()
	.min(8, 'Password must be at least 8 characters.')
	.max(255);

const phone = z
	.string()
	.trim()
	.max(32)
	.transform((v) => (v === '' ? undefined : v))
	.optional();

/**
 * Roles come in from `<select multiple>` / CSV as a string like "1,3".
 * Empty input → no override. Each id must be a known `RoleType`.
 */
const roles = z
	.string()
	.transform((v) => v.trim())
	.transform((v) =>
		v === ''
			? undefined
			: v
					.split(',')
					.map((s) => Number(s.trim()))
					.filter((n) => Number.isFinite(n)),
	)
	.refine(
		(arr) => arr === undefined || arr.every((n) => n in RoleType),
		'One or more selected roles are invalid.',
	)
	.optional();

/* ------------------------------------------------------------------ */
/*  Create — outputs `CreateUserPayload` directly.                    */
/* ------------------------------------------------------------------ */

export const createUserSchema = z
	.object({
		name,
		email,
		password,
		phone_number: phone,
		roles,
	})
	.transform<CreateUserPayload>((v) => ({
		name: v.name,
		email: v.email,
		password: v.password,
		...(v.phone_number ? { phone_number: v.phone_number } : {}),
		...(v.roles ? { roles: v.roles as RoleType[] } : {}),
	}));

/* ------------------------------------------------------------------ */
/*  Update — every field optional; password only when explicitly set. */
/* ------------------------------------------------------------------ */

export const updateUserSchema = z
	.object({
		name: z.union([name, z.literal('').transform(() => undefined)]).optional(),
		email: z
			.union([email, z.literal('').transform(() => undefined)])
			.optional(),
		password: z
			.union([password, z.literal('').transform(() => undefined)])
			.optional(),
		phone_number: phone,
		roles,
	})
	.transform<UpdateUserPayload>((v) => ({
		...(v.name !== undefined ? { name: v.name } : {}),
		...(v.email !== undefined ? { email: v.email } : {}),
		...(v.password !== undefined ? { password: v.password } : {}),
		...(v.phone_number !== undefined ? { phone_number: v.phone_number } : {}),
		...(v.roles ? { roles: v.roles as RoleType[] } : {}),
	}));
