/**
 * Generic state shape used by all Server-Action backed forms.
 * `useActionState` carries this between server and client.
 */
export interface FormState<
	TValues extends Record<string, string> = Record<string, string>,
> {
	ok?: boolean;
	/** Top-level error message (e.g. "Invalid credentials"). */
	message?: string;
	/** Field-level validation errors. */
	errors?: Partial<Record<keyof TValues | string, string[]>>;
	/** Sticky form values to re-populate inputs on re-render. */
	values?: Partial<TValues>;
}

export function formFields<P>() {
	return <const T extends ReadonlyArray<keyof P & string>>(
		fields: T &
			([Exclude<keyof P & string, T[number]>] extends [never]
				? unknown
				: {
						__error: 'formFields(): tuple is missing payload keys';
						missing: Exclude<keyof P & string, T[number]>;
					}),
	): T => fields;
}
