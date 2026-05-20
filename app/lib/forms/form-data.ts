/**
 * Read a fixed set of named fields from a FormData into a typed object of
 * strings. The keys tuple is the single source of truth for the form shape —
 * defining the shape once avoids drift between actions, schemas, and UI.
 *
 * @example
 *   const FIELDS = ['email', 'password'] as const;
 *   type Values = Record<(typeof FIELDS)[number], string>;
 *   const values: Values = readFormValues(formData, FIELDS);
 */
export function readFormValues<const TKey extends string>(
	formData: FormData,
	fields: readonly TKey[],
): Record<TKey, string> {
	const out = {} as Record<TKey, string>;
	for (const key of fields) {
		const v = formData.get(key);
		out[key] = typeof v === 'string' ? v : '';
	}
	return out;
}
