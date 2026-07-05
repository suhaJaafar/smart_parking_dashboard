'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export interface ParkOption {
	id: string;
	name: string;
}

/**
 * Garage filter for the cars list. Navigating updates the `?park_id=` query
 * (and resets to page 1) so the server component re-fetches the scoped list.
 */
export function ParkFilter({
	parks,
	selected,
}: {
	parks: readonly ParkOption[];
	selected: string | null;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	function onChange(value: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (value) params.set('park_id', value);
		else params.delete('park_id');
		params.delete('page');
		const qs = params.toString();
		router.push(qs ? `/dashboard/cars?${qs}` : '/dashboard/cars');
	}

	return (
		<label className='flex items-center gap-2 text-sm'>
			<span className='text-zinc-500 dark:text-zinc-400'>Garage</span>
			<select
				value={selected ?? ''}
				onChange={(e) => onChange(e.currentTarget.value)}
				className='h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm shadow-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-800'
			>
				<option value=''>All parks</option>
				{parks.map((p) => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
			</select>
		</label>
	);
}
