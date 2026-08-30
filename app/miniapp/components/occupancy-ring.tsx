/**
 * Occupancy dial.
 *
 * A pure-SVG ring rather than a chart library: this renders inside a server
 * component, on a phone, above the fold — pulling Recharts in here would ship
 * a large client bundle to draw a single circle.
 *
 * The sweep is animated by transitioning `stroke-dashoffset` from empty to the
 * target, so the ring fills on entry instead of snapping.
 */
export function OccupancyRing({
	value,
	size = 88,
	stroke = 9,
}: {
	/** Percentage 0–100. Values outside the range are clamped. */
	value: number;
	size?: number;
	stroke?: number;
}) {
	const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference * (1 - pct / 100);

	// Green while there is room, amber as it tightens, red when effectively full.
	const color =
		pct >= 90 ? 'var(--sp-danger)' : pct >= 70 ? 'var(--sp-accent)' : '#22c55e';

	return (
		<svg
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className='shrink-0 -rotate-90'
			role='img'
			aria-label={`Occupancy ${Math.round(pct)} percent`}
		>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill='none'
				strokeWidth={stroke}
				stroke='color-mix(in srgb, var(--sp-text) 10%, transparent)'
			/>
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill='none'
				strokeWidth={stroke}
				stroke={color}
				strokeLinecap='round'
				strokeDasharray={circumference}
				strokeDashoffset={offset}
				style={{
					transition: 'stroke-dashoffset 900ms var(--sp-ease)',
				}}
			>
				<animate
					attributeName='stroke-dashoffset'
					from={circumference}
					to={offset}
					dur='0.9s'
					fill='freeze'
					calcMode='spline'
					keySplines='0.22 1 0.36 1'
				/>
			</circle>
		</svg>
	);
}
