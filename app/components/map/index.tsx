'use client';

import dynamic from 'next/dynamic';

/**
 * Leaflet touches `window` at import time, so the real picker is dynamically
 * imported with SSR disabled. Consumers import this wrapper exactly as if it
 * were the picker itself.
 */
export const LocationPicker = dynamic(
	() =>
		import('./location-picker').then((mod) => ({
			default: mod.LocationPicker,
		})),
	{
		ssr: false,
		loading: () => (
			<div className='grid h-[320px] place-items-center rounded-md border border-zinc-300 bg-zinc-50 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900'>
				Loading map…
			</div>
		),
	},
);

export type { PickedLocation } from './location-picker';
