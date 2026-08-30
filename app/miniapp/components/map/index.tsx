'use client';

import dynamic from 'next/dynamic';

/**
 * Leaflet reads `window` at import time, so the real map is loaded only in the
 * browser. Consumers import this wrapper exactly as if it were the map — same
 * arrangement as the dashboard's `app/components/map`.
 */
export const ParksMap = dynamic(
	() => import('./parks-map').then((mod) => ({ default: mod.ParksMap })),
	{
		ssr: false,
		loading: () => (
			<div
				className='sp-skeleton mx-5 rounded-2xl'
				style={{ height: '60vh' }}
				aria-label='جارٍ تحميل الخريطة'
			/>
		),
	},
);
