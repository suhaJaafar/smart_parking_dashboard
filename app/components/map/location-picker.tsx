'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import {
	MapContainer,
	Marker,
	TileLayer,
	useMap,
	useMapEvents,
} from 'react-leaflet';

import type { ReverseGeocodeResult } from '@/app/types/geocode';

/**
 * Leaflet's default marker icon assumes a relative URL on the host page and
 * breaks under bundlers. Wire it explicitly to CDN assets — once per module.
 */
const DEFAULT_ICON = L.icon({
	iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
	iconRetinaUrl:
		'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
	shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

/** Iraq centre — a sensible default if the form has no starting coordinate. */
const DEFAULT_CENTER: [number, number] = [33.3152, 44.3661];

export type PickedLocation = ReverseGeocodeResult;

interface LocationPickerProps {
	value: { lat: number; lng: number } | null;
	onPick: (picked: PickedLocation) => void;
	height?: number;
	disabled?: boolean;
}

export function LocationPicker({
	value,
	onPick,
	height = 320,
	disabled = false,
}: LocationPickerProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const center: [number, number] = useMemo(
		() => (value ? [value.lat, value.lng] : DEFAULT_CENTER),
		[value],
	);

	const handlePick = async (lat: number, lng: number) => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`, {
				cache: 'no-store',
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(body?.error ?? 'Could not resolve that location.');
			}
			const { data } = (await res.json()) as { data: PickedLocation };
			onPick(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Geocoding failed.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex flex-col gap-2'>
			<div
				className='overflow-hidden rounded-md border border-zinc-300 dark:border-zinc-700'
				style={{ height }}
			>
				<MapContainer
					center={center}
					zoom={value ? 13 : 6}
					scrollWheelZoom
					style={{ height: '100%', width: '100%' }}
				>
					<TileLayer
						attribution='&copy; OpenStreetMap contributors'
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					/>
					<RecenterOnChange position={value} />
					<ClickHandler disabled={disabled || loading} onClick={handlePick} />
					{value ? (
						<Marker position={[value.lat, value.lng]} icon={DEFAULT_ICON} />
					) : null}
				</MapContainer>
			</div>

			<p className='text-xs text-zinc-500 dark:text-zinc-400'>
				{loading
					? 'Resolving address…'
					: value
						? `Selected: ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`
						: 'Click anywhere on the map to drop a pin.'}
			</p>

			{error ? (
				<p className='text-xs text-red-600 dark:text-red-400'>{error}</p>
			) : null}
		</div>
	);
}

function ClickHandler({
	disabled,
	onClick,
}: {
	disabled: boolean;
	onClick: (lat: number, lng: number) => void;
}) {
	useMapEvents({
		click(event) {
			if (disabled) return;
			onClick(event.latlng.lat, event.latlng.lng);
		},
	});
	return null;
}

function RecenterOnChange({
	position,
}: {
	position: { lat: number; lng: number } | null;
}) {
	const map = useMap();
	useEffect(() => {
		if (position) map.flyTo([position.lat, position.lng], 14);
	}, [position, map]);
	return null;
}
