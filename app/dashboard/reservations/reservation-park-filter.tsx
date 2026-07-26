'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export interface ReservationParkOption {
	id: string;
	name: string;
}

/**
 * Garage filter for the reservations list. Navigating updates the
 * `?park_id=` query (and resets to page 1) so the server component re-fetches
 * the scoped list. Mirrors `ParkFilter` under `dashboard/cars`.
 */
export function ReservationParkFilter({
	parks,
	selected,
	basePath = '/dashboard/reservations',
}: {
	parks: readonly ReservationParkOption[];
	selected: string | null;
	basePath?: string;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();

	function onChange(value: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (value) params.set('park_id', value);
		else params.delete('park_id');
		params.delete('page');
		const qs = params.toString();
		router.push(qs ? `${basePath}?${qs}` : basePath);
	}

	return (
		<label className='inline-flex items-center gap-2 text-sm'>
			<span className='text-zinc-600 dark:text-zinc-400'>Garage:</span>
			<select
				value={selected ?? ''}
				onChange={(e) => onChange(e.target.value)}
				className='rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950'
			>
				<option value=''>All garages</option>
				{parks.map((p) => (
					<option key={p.id} value={p.id}>
						{p.name}
					</option>
				))}
			</select>
		</label>
	);
}
