import { z, type ZodError } from 'zod';

import type { ApiErrorBody } from '@/app/types/api';
import type { FormState } from '@/app/types/forms';

/**
 * Build a `FormState` representing a Zod validation failure. Field-level
 * errors are extracted via `z.flattenError` and the original `values` are
 * preserved so the form re-renders sticky.
 */
export function validationFailure<TValues extends Record<string, string>>(
	error: ZodError,
	values: TValues,
): FormState<TValues> {
	return {
		ok: false,
		errors: z.flattenError(error).fieldErrors as FormState<TValues>['errors'],
		values,
	};
}

/**
 * Build a `FormState` representing an API error returned by the Laravel
 * backend. Falls back to the provided message if the body has none.
 */
export function apiFailure<TValues extends Record<string, string>>(
	error: ApiErrorBody | null,
	fallbackMessage: string,
	values?: TValues,
): FormState<TValues> {
	return {
		ok: false,
		message: error?.message ?? error?.error ?? fallbackMessage,
		errors: error?.errors as FormState<TValues>['errors'],
		values,
	};
}

/** Convenience: build a top-level error without field details. */
export function formError<TValues extends Record<string, string>>(
	message: string,
	values?: TValues,
): FormState<TValues> {
	return { ok: false, message, values };
}
