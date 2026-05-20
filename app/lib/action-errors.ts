/**
 * Maps the `?error=...` codes emitted by server actions into human-readable
 * banner copy for list pages.
 *
 * Server actions redirect with a small, stable set of codes (`forbidden`,
 * `not_found`, `delete_failed`, …). The set is shared across every CRUD
 * resource; only the noun in the user-facing sentence changes — so each list
 * page passes its own `resource` label (e.g. `'parking'`, `'user'`).
 *
 * @example
 *   actionErrorMessage('not_found', 'parking') // "Parking not found."
 *   actionErrorMessage('delete_failed', 'user') // "Failed to delete the user."
 */
export function actionErrorMessage(code: string, resource: string): string {
	switch (code) {
		case 'forbidden':
			return 'You are not allowed to perform that action.';
		case 'not_found':
			return `${capitalize(resource)} not found.`;
		case 'delete_failed':
			return `Failed to delete the ${resource}.`;
		default:
			return 'Something went wrong.';
	}
}

function capitalize(word: string): string {
	return word.charAt(0).toUpperCase() + word.slice(1);
}
