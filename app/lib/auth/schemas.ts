import { z } from 'zod';

/**
 * Validation schemas — mirror the backend `LoginRequest` / `RegisterRequest`
 * rules so client-side errors match what Laravel would return.
 */

export const loginSchema = z.object({
	email: z.string().trim().email('Please enter a valid email.'),
	password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const registerSchema = z.object({
	name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
	email: z.string().trim().email('Please enter a valid email.'),
	password: z.string().min(8, 'Password must be at least 8 characters.'),
	phone_number: z
		.string()
		.trim()
		.max(32, 'Phone number must be at most 32 characters.')
		.optional()
		.or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
