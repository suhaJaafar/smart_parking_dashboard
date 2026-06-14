export { loginAction } from './login';
export { registerAction } from './register';
export { logoutAction } from './logout';
export { whatsappRequestCodeAction } from './whatsapp-request-code';
export { whatsappVerifyCodeAction } from './whatsapp-verify-code';
export { telegramVerifyCodeAction } from './telegram-verify-code';

// Form-state types live alongside the form metadata so they can be imported
// from Client Components without crossing a `'use server'` boundary.
export type {
	LoginFormState,
	LoginFormValues,
	RegisterFormState,
	RegisterFormValues,
	WhatsappRequestCodeFormState,
	WhatsappRequestCodeFormValues,
	WhatsappVerifyCodeFormState,
	WhatsappVerifyCodeFormValues,
	TelegramVerifyCodeFormState,
	TelegramVerifyCodeFormValues,
} from '@/app/lib/auth/forms';
