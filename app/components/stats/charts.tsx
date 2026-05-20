'use client';

import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { OCCUPANCY_HEX, occupancyTone } from '@/app/lib/stats/occupancy';

/**
 * Thin wrappers around Recharts so the rest of the codebase imports a single
 * stable API. Tuned for the dashboard's compact density.
 *
 * All components are `'use client'` because Recharts relies on browser-only
 * APIs (window, ResizeObserver) under the hood.
 */

/** Categorical palette — accessible against both themes. */
const PALETTE = [
	'#2563eb', // blue-600
	'#16a34a', // green-600
	'#f59e0b', // amber-500
	'#dc2626', // red-600
	'#9333ea', // purple-600
	'#0891b2', // cyan-600
	'#db2777', // pink-600
	'#65a30d', // lime-600
];

const AXIS_TICK = {
	fontSize: 11,
	fill: 'currentColor',
	className: 'fill-zinc-500',
};

interface CategoryDatum {
	label: string;
	count: number;
}

/**
 * Vertical bar chart for "X by category". Caller supplies pre-sorted data;
 * we don't sort here because the order is meaningful.
 */
export function CategoryBarChart({
	data,
	height = 260,
	color = PALETTE[0],
	xLabel,
}: {
	data: readonly CategoryDatum[];
	height?: number;
	color?: string;
	xLabel?: string;
}) {
	if (data.length === 0) return <EmptyState />;

	return (
		<ResponsiveContainer width='100%' height={height}>
			<BarChart
				data={data as CategoryDatum[]}
				margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
			>
				<CartesianGrid
					strokeDasharray='3 3'
					vertical={false}
					className='stroke-zinc-200 dark:stroke-zinc-800'
				/>
				<XAxis
					dataKey='label'
					tick={AXIS_TICK}
					interval={0}
					angle={data.length > 6 ? -25 : 0}
					textAnchor={data.length > 6 ? 'end' : 'middle'}
					height={data.length > 6 ? 60 : 30}
					label={
						xLabel
							? {
									value: xLabel,
									position: 'insideBottom',
									offset: -5,
									fontSize: 11,
								}
							: undefined
					}
				/>
				<YAxis allowDecimals={false} tick={AXIS_TICK} width={32} />
				<Tooltip
					cursor={{ className: 'fill-zinc-100 dark:fill-zinc-900' }}
					contentStyle={{
						fontSize: 12,
						borderRadius: 8,
						border: '1px solid rgba(0,0,0,0.06)',
					}}
				/>
				<Bar dataKey='count' radius={[6, 6, 0, 0]} fill={color} />
			</BarChart>
		</ResponsiveContainer>
	);
}

/** Donut chart for share-of-total breakdowns (e.g. users by role). */
export function CategoryDonutChart({
	data,
	height = 260,
}: {
	data: readonly CategoryDatum[];
	height?: number;
}) {
	const total = data.reduce((acc, d) => acc + d.count, 0);
	if (total === 0) return <EmptyState />;

	return (
		<ResponsiveContainer width='100%' height={height}>
			<PieChart>
				<Pie
					data={data as CategoryDatum[]}
					dataKey='count'
					nameKey='label'
					cx='50%'
					cy='50%'
					innerRadius='55%'
					outerRadius='80%'
					paddingAngle={2}
					stroke='none'
				>
					{data.map((_, i) => (
						<Cell key={i} fill={PALETTE[i % PALETTE.length]} />
					))}
				</Pie>
				<Tooltip
					formatter={(value, name) => {
						const n = typeof value === 'number' ? value : Number(value ?? 0);
						const pct = total ? Math.round((n / total) * 100) : 0;
						return [`${n} (${pct}%)`, String(name ?? '')];
					}}
					contentStyle={{
						fontSize: 12,
						borderRadius: 8,
						border: '1px solid rgba(0,0,0,0.06)',
					}}
				/>
				<Legend
					verticalAlign='bottom'
					height={28}
					iconSize={8}
					wrapperStyle={{ fontSize: 11 }}
				/>
			</PieChart>
		</ResponsiveContainer>
	);
}

/** Horizontal radial-style progress for a single percentage (0–100). */
export function GaugeRing({ value, label }: { value: number; label?: string }) {
	const pct = Math.max(0, Math.min(100, value));
	const radius = 56;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (pct / 100) * circumference;
	const color = OCCUPANCY_HEX[occupancyTone(pct)];

	return (
		<div className='flex flex-col items-center gap-2'>
			<svg width={140} height={140} viewBox='0 0 140 140'>
				<circle
					cx={70}
					cy={70}
					r={radius}
					strokeWidth={12}
					className='stroke-zinc-200 dark:stroke-zinc-800'
					fill='none'
				/>
				<circle
					cx={70}
					cy={70}
					r={radius}
					strokeWidth={12}
					fill='none'
					stroke={color}
					strokeLinecap='round'
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					transform='rotate(-90 70 70)'
				/>
				<text
					x='50%'
					y='50%'
					textAnchor='middle'
					dominantBaseline='central'
					className='fill-zinc-900 dark:fill-zinc-50'
					fontSize={22}
					fontWeight={600}
				>
					{pct.toFixed(0)}%
				</text>
			</svg>
			{label ? (
				<p className='text-xs text-zinc-500 dark:text-zinc-400'>{label}</p>
			) : null}
		</div>
	);
}

function EmptyState() {
	return (
		<div className='grid h-[200px] place-items-center text-xs text-zinc-500 dark:text-zinc-400'>
			No data yet.
		</div>
	);
}
