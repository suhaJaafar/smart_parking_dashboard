'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useMemo } from 'react';
import {
	MapContainer,
	Marker,
	Polyline,
	TileLayer,
	useMap,
	ZoomControl,
} from 'react-leaflet';

import type { Coordinates, NearbyPark } from '@/app/types/miniapp';

/** Baghdad — only used if a fix and every park somehow lack coordinates. */
const FALLBACK_CENTER: [number, number] = [33.3152, 44.3661];

interface ParksMapProps {
	parks: NearbyPark[];
	origin: Coordinates | null;
	selected: NearbyPark | null;
	onSelect: (park: NearbyPark) => void;
	height?: number | string;
}

/** Parks that actually have a point to draw. */
function locatable(parks: NearbyPark[]) {
	return parks.filter(
		(p): p is NearbyPark & { latitude: number; longitude: number } =>
			typeof p.latitude === 'number' && typeof p.longitude === 'number',
	);
}

/**
 * Marker labels are injected as raw HTML because Leaflet's divIcon takes a
 * string, and garage names are user-supplied — so they are escaped here
 * rather than trusted.
 */
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function parkIcon(park: NearbyPark, isSelected: boolean): L.DivIcon {
	const free = park.free_spaces ?? 0;
	const tone = free > 0 ? 'has-space' : 'is-full';

	return L.divIcon({
		className: 'sp-map-marker',
		html: `
			<div class="sp-pin ${tone} ${isSelected ? 'is-selected' : ''}">
				<span class="sp-pin-badge">${free}</span>
				<span class="sp-pin-label">${escapeHtml(park.name)}</span>
			</div>
		`,
		// Zero size + centred anchor lets CSS own the real dimensions, so the
		// label can grow without knocking the pin off its coordinate.
		iconSize: [0, 0],
		iconAnchor: [0, 0],
	});
}

const originIcon = (): L.DivIcon =>
	L.divIcon({
		className: 'sp-map-marker',
		html: '<div class="sp-origin"><span class="sp-origin-pulse"></span><span class="sp-origin-dot"></span></div>',
		iconSize: [0, 0],
		iconAnchor: [0, 0],
	});

/**
 * Nearby garages on a map.
 *
 * Rendered only through `./index.tsx`, which dynamically imports it with SSR
 * disabled — Leaflet touches `window` at module scope.
 */
export function ParksMap({
	parks,
	origin,
	selected,
	onSelect,
	height = '60vh',
}: ParksMapProps) {
	const points = useMemo(() => locatable(parks), [parks]);

	const center = useMemo<[number, number]>(() => {
		if (origin) return [origin.latitude, origin.longitude];
		if (points[0]) return [points[0].latitude, points[0].longitude];
		return FALLBACK_CENTER;
	}, [origin, points]);

	return (
		<div className='sp-map-shell' style={{ height }}>
			<MapContainer
				center={center}
				zoom={14}
				zoomControl={false}
				scrollWheelZoom={false}
				attributionControl={false}
				style={{ height: '100%', width: '100%' }}
			>
				<TileLayer
					attribution='&copy; OpenStreetMap'
					url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
				/>

				<ZoomControl position='topleft' />

				<FitToContent points={points} origin={origin} selected={selected} />

				{origin && (
					<Marker
						position={[origin.latitude, origin.longitude]}
						icon={originIcon()}
						interactive={false}
					/>
				)}

				{/* Straight line, not a driving route: it shows which way the garage
				    lies without pretending to be navigation. */}
				{origin && selected?.latitude != null && selected.longitude != null && (
					<Polyline
						positions={[
							[origin.latitude, origin.longitude],
							[selected.latitude, selected.longitude],
						]}
						pathOptions={{
							// Colour comes from `.sp-route`; a CSS var in an SVG stroke
							// presentation attribute would not resolve.
							className: 'sp-route',
							weight: 3,
							dashArray: '7 9',
						}}
					/>
				)}

				{points.map((park) => (
					<Marker
						key={park.id}
						position={[park.latitude, park.longitude]}
						icon={parkIcon(park, selected?.id === park.id)}
						zIndexOffset={selected?.id === park.id ? 1000 : 0}
						eventHandlers={{ click: () => onSelect(park) }}
					/>
				))}
			</MapContainer>
		</div>
	);
}

/**
 * Keeps the viewport meaningful without stealing control from the user.
 *
 * On first paint everything is framed; after that only an explicit selection
 * moves the camera. Panning around is never overridden, which is what makes
 * the map feel like a map rather than a slideshow.
 */
function FitToContent({
	points,
	origin,
	selected,
}: {
	points: (NearbyPark & { latitude: number; longitude: number })[];
	origin: Coordinates | null;
	selected: NearbyPark | null;
}) {
	const map = useMap();

	useEffect(() => {
		const coords: [number, number][] = points.map((p) => [
			p.latitude,
			p.longitude,
		]);
		if (origin) coords.push([origin.latitude, origin.longitude]);
		if (coords.length === 0) return;

		map.fitBounds(L.latLngBounds(coords), {
			padding: [48, 48],
			maxZoom: 16,
			animate: true,
		});
		// Deliberately keyed on the data, not on `selected` — refitting on every
		// tap would yank the map away from wherever the user had panned.
	}, [map, points, origin]);

	useEffect(() => {
		if (selected?.latitude == null || selected.longitude == null) return;

		map.flyTo(
			[selected.latitude, selected.longitude],
			Math.max(map.getZoom(), 15),
			{
				duration: 0.6,
			},
		);
	}, [map, selected]);

	return null;
}
