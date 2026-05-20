export { loginAction } from './login';
export { registerAction } from './register';
export { logoutAction } from './logout';

// Form-state types live alongside the form metadata so they can be imported
// from Client Components without crossing a `'use server'` boundary.
export type {
	LoginFormState,
	LoginFormValues,
	RegisterFormState,
	RegisterFormValues,
} from '@/app/lib/auth/forms';
