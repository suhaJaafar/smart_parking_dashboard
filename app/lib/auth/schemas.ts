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

/**
 * WhatsApp OTP login. The backend accepts either +<country><number> or just
 * digits — we keep validation lax here and let Laravel be the source of truth
 * for the exact regex.
 */
export const whatsappRequestCodeSchema = z.object({
	phone_number: z
		.string()
		.trim()
		.regex(/^\+?[0-9]{8,15}$/, 'Enter a valid phone number with country code.'),
});

export const whatsappVerifyCodeSchema = z.object({
	phone_number: z
		.string()
		.trim()
		.regex(/^\+?[0-9]{8,15}$/, 'Enter a valid phone number with country code.'),
	code: z
		.string()
		.trim()
		.regex(/^[0-9]{6}$/, 'Enter the 6-digit code we sent on WhatsApp.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type WhatsappRequestCodeInput = z.infer<
	typeof whatsappRequestCodeSchema
>;
export type WhatsappVerifyCodeInput = z.infer<typeof whatsappVerifyCodeSchema>;
