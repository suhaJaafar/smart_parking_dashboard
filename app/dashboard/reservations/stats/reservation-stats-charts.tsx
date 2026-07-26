'use client';

import {
	Area,
	AreaChart,
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

/**
 * Feature-scoped chart primitives for the reservations-analytics page.
 *
 * Isolated from `app/components/stats/charts.tsx` so this new surface
 * cannot affect the admin/owner dashboard charts that already ship. Same
 * visual language — Recharts, compact axes, consistent palette.
 *
 * Every component is `'use client'` because Recharts relies on browser-only
 * APIs (window, ResizeObserver) under the hood.
 */

const PALETTE = {
	primary: '#f59e0b', // amber-500 — matches the reservations "amber" theme
	completed: '#16a34a', // green-600
	warning: '#f97316', // orange-500
	danger: '#dc2626', // red-600
	muted: '#71717a', // zinc-500
} as const;

const STATUS_COLORS: Record<number, string> = {
	1: '#f59e0b', // waiting → amber
	2: '#16a34a', // active → green
	4: '#3b82f6', // completed → blue
	5: '#dc2626', // expired → red
	7: '#f97316', // cancelled → orange
};

const AXIS_TICK = {
	fontSize: 11,
	fill: 'currentColor',
	className: 'fill-zinc-500',
};

const TOOLTIP_STYLE = {
	fontSize: 12,
	borderRadius: 8,
	border: '1px solid rgba(0,0,0,0.06)',
	background: 'rgba(255,255,255,0.98)',
	color: '#18181b',
};

/* -------------------------------------------------------------------------- */
/*  Reservations by day — area chart                                          */
/* -------------------------------------------------------------------------- */

interface DailyDatum {
	date: string;
	count: number;
	completed: number;
}

/**
 * Stacked area chart of the reservation volume per day (with a distinct
 * layer for completed stays). Densified upstream so gaps read as zeros
 * rather than as missing data.
 */
export function ReservationsByDayChart({
	data,
	height = 260,
}: {
	data: readonly DailyDatum[];
	height?: number;
}) {
	if (data.length === 0) return <EmptyState />;

	return (
		<ResponsiveContainer width='100%' height={height}>
			<AreaChart
				data={data as DailyDatum[]}
				margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
			>
				<defs>
					<linearGradient id='rsv-total' x1='0' y1='0' x2='0' y2='1'>
						<stop offset='5%' stopColor={PALETTE.primary} stopOpacity={0.35} />
						<stop offset='95%' stopColor={PALETTE.primary} stopOpacity={0} />
					</linearGradient>
					<linearGradient id='rsv-completed' x1='0' y1='0' x2='0' y2='1'>
						<stop
							offset='5%'
							stopColor={PALETTE.completed}
							stopOpacity={0.35}
						/>
						<stop offset='95%' stopColor={PALETTE.completed} stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid
					strokeDasharray='3 3'
					vertical={false}
					className='stroke-zinc-200 dark:stroke-zinc-800'
				/>
				<XAxis
					dataKey='date'
					tick={AXIS_TICK}
					tickFormatter={formatDayTick}
					minTickGap={16}
				/>
				<YAxis allowDecimals={false} tick={AXIS_TICK} width={32} />
				<Tooltip
					contentStyle={TOOLTIP_STYLE}
					labelFormatter={(v) => formatDayLabel(String(v))}
				/>
				<Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
				<Area
					type='monotone'
					dataKey='count'
					name='All reservations'
					stroke={PALETTE.primary}
					strokeWidth={2}
					fill='url(#rsv-total)'
				/>
				<Area
					type='monotone'
					dataKey='completed'
					name='Completed'
					stroke={PALETTE.completed}
					strokeWidth={2}
					fill='url(#rsv-completed)'
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}

/* -------------------------------------------------------------------------- */
/*  Peak-hour histogram                                                       */
/* -------------------------------------------------------------------------- */

interface HourDatum {
	hour: number;
	count: number;
}

/** Simple 24-bar histogram — reservation `created_at` hour of day. */
export function PeakHourChart({
	data,
	height = 220,
}: {
	data: readonly HourDatum[];
	height?: number;
}) {
	if (data.every((d) => d.count === 0)) return <EmptyState />;

	return (
		<ResponsiveContainer width='100%' height={height}>
			<BarChart
				data={data as HourDatum[]}
				margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
			>
				<CartesianGrid
					strokeDasharray='3 3'
					vertical={false}
					className='stroke-zinc-200 dark:stroke-zinc-800'
				/>
				<XAxis
					dataKey='hour'
					tick={AXIS_TICK}
					tickFormatter={(h: number) => `${h}h`}
					interval={1}
				/>
				<YAxis allowDecimals={false} tick={AXIS_TICK} width={32} />
				<Tooltip
					contentStyle={TOOLTIP_STYLE}
					formatter={(v) => [String(v), 'Reservations']}
					labelFormatter={(v) => `${v}:00 – ${Number(v) + 1}:00`}
				/>
				<Bar dataKey='count' radius={[4, 4, 0, 0]} fill={PALETTE.primary} />
			</BarChart>
		</ResponsiveContainer>
	);
}

/* -------------------------------------------------------------------------- */
/*  Duration histogram                                                        */
/* -------------------------------------------------------------------------- */

interface DurationDatum {
	label: string;
	count: number;
}

/** Vertical bar chart for the completed-stay duration distribution. */
export function DurationHistogramChart({
	data,
	height = 220,
}: {
	data: readonly DurationDatum[];
	height?: number;
}) {
	if (data.every((d) => d.count === 0)) return <EmptyState />;

	return (
		<ResponsiveContainer width='100%' height={height}>
			<BarChart
				data={data as DurationDatum[]}
				margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
			>
				<CartesianGrid
					strokeDasharray='3 3'
					vertical={false}
					className='stroke-zinc-200 dark:stroke-zinc-800'
				/>
				<XAxis dataKey='label' tick={AXIS_TICK} interval={0} height={30} />
				<YAxis allowDecimals={false} tick={AXIS_TICK} width={32} />
				<Tooltip
					contentStyle={TOOLTIP_STYLE}
					formatter={(v) => [String(v), 'Reservations']}
				/>
				<Bar dataKey='count' radius={[6, 6, 0, 0]} fill={PALETTE.completed} />
			</BarChart>
		</ResponsiveContainer>
	);
}

/* -------------------------------------------------------------------------- */
/*  Status donut                                                              */
/* -------------------------------------------------------------------------- */

interface StatusDatum {
	status: number;
	label: string;
	count: number;
}

/**
 * Status-share donut. Colors are aligned with the reservations-page badge
 * palette so the donut and the status column visually agree.
 */
export function StatusDonutChart({
	data,
	height = 240,
}: {
	data: readonly StatusDatum[];
	height?: number;
}) {
	const total = data.reduce((acc, d) => acc + d.count, 0);
	if (total === 0) return <EmptyState />;

	return (
		<ResponsiveContainer width='100%' height={height}>
			<PieChart>
				<Pie
					data={data as StatusDatum[]}
					dataKey='count'
					nameKey='label'
					cx='50%'
					cy='50%'
					innerRadius='55%'
					outerRadius='80%'
					paddingAngle={2}
					stroke='none'
				>
					{data.map((d) => (
						<Cell
							key={d.status}
							fill={STATUS_COLORS[d.status] ?? PALETTE.muted}
						/>
					))}
				</Pie>
				<Tooltip
					contentStyle={TOOLTIP_STYLE}
					formatter={(value, name) => {
						const n = typeof value === 'number' ? value : Number(value ?? 0);
						const pct = total ? Math.round((n / total) * 100) : 0;
						return [`${n} (${pct}%)`, String(name ?? '')];
					}}
				/>
				<Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
			</PieChart>
		</ResponsiveContainer>
	);
}

/* -------------------------------------------------------------------------- */
/*  Top parks — horizontal bar                                                */
/* -------------------------------------------------------------------------- */

interface ParkDatum {
	name: string;
	count: number;
}

/** Vertical bar chart of the top-N parks by reservation volume. */
export function TopParksChart({
	data,
	height = 260,
}: {
	data: readonly ParkDatum[];
	height?: number;
}) {
	if (data.length === 0) return <EmptyState />;

	return (
		<ResponsiveContainer width='100%' height={height}>
			<BarChart
				data={data as ParkDatum[]}
				margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
			>
				<CartesianGrid
					strokeDasharray='3 3'
					vertical={false}
					className='stroke-zinc-200 dark:stroke-zinc-800'
				/>
				<XAxis
					dataKey='name'
					tick={AXIS_TICK}
					interval={0}
					angle={data.length > 4 ? -20 : 0}
					textAnchor={data.length > 4 ? 'end' : 'middle'}
					height={data.length > 4 ? 60 : 30}
				/>
				<YAxis allowDecimals={false} tick={AXIS_TICK} width={32} />
				<Tooltip
					contentStyle={TOOLTIP_STYLE}
					formatter={(v) => [String(v), 'Reservations']}
				/>
				<Bar dataKey='count' radius={[6, 6, 0, 0]} fill={PALETTE.primary} />
			</BarChart>
		</ResponsiveContainer>
	);
}

/* -------------------------------------------------------------------------- */
/*  Shared empty-state placeholder                                            */
/* -------------------------------------------------------------------------- */

function EmptyState() {
	return (
		<div className='grid h-[200px] place-items-center text-xs text-zinc-500 dark:text-zinc-400'>
			No data for this range yet.
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*  Tick formatters                                                           */
/* -------------------------------------------------------------------------- */

function formatDayTick(iso: string): string {
	// Expect YYYY-MM-DD. Parsing as a date rather than Date() avoids TZ shifts.
	const [y, m, d] = iso.split('-');
	if (!y || !m || !d) return iso;
	const date = new Date(Number(y), Number(m) - 1, Number(d));
	return new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
	}).format(date);
}

function formatDayLabel(iso: string): string {
	const [y, m, d] = iso.split('-');
	if (!y || !m || !d) return iso;
	const date = new Date(Number(y), Number(m) - 1, Number(d));
	return new Intl.DateTimeFormat(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	}).format(date);
}
