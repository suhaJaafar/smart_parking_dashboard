/**
 * Shows the geocoder's full address line for the currently-pinned point.
 *
 * Purely informational — the editable Country / State / City / Postal fields
 * are the source of truth that the form actually submits. The headline just
 * gives the operator a human-readable confirmation of where their pin landed.
 */
export function LocationHeadline({
	coords,
	displayName,
}: {
	coords: { lat: number; lng: number } | null;
	displayName: string;
}) {
	if (!coords) {
		return (
			<p className='rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'>
				No location selected yet.
			</p>
		);
	}

	return (
		<div className='rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900'>
			<p className='font-medium text-zinc-800 dark:text-zinc-100'>
				{displayName || 'Pinned point — fill in the address below.'}
			</p>
			<p className='mt-0.5 text-zinc-500 dark:text-zinc-400'>
				{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
			</p>
		</div>
	);
}
