import type { ReactNode } from 'react';

/**
 * KPI tile for a single headline metric. Use sparingly — too many compete
 * for attention. A trend or context line goes in `hint`.
 */
export function StatCard({
	label,
	value,
	hint,
	icon,
	tone = 'default',
}: {
	label: string;
	value: ReactNode;
	hint?: ReactNode;
	icon?: ReactNode;
	tone?: 'default' | 'positive' | 'warning' | 'danger';
}) {
	const toneCls = TONE[tone];

	return (
		<div
			className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-zinc-950 ${toneCls.border}`}
		>
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0'>
					<p className='text-xs font-medium uppercase tracking-wide text-zinc-500'>
						{label}
					</p>
					<p
						className={`mt-2 text-2xl font-semibold tabular-nums ${toneCls.text}`}
					>
						{value}
					</p>
					{hint ? (
						<p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
							{hint}
						</p>
					) : null}
				</div>
				{icon ? (
					<div
						className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${toneCls.iconBg} ${toneCls.iconFg}`}
					>
						{icon}
					</div>
				) : null}
			</div>
		</div>
	);
}

const TONE = {
	default: {
		border: 'border-black/[.06] dark:border-white/[.08]',
		text: 'text-zinc-900 dark:text-zinc-50',
		iconBg: 'bg-zinc-100 dark:bg-zinc-900',
		iconFg: 'text-zinc-700 dark:text-zinc-300',
	},
	positive: {
		border: 'border-emerald-200 dark:border-emerald-900',
		text: 'text-emerald-700 dark:text-emerald-300',
		iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
		iconFg: 'text-emerald-700 dark:text-emerald-300',
	},
	warning: {
		border: 'border-amber-200 dark:border-amber-900',
		text: 'text-amber-700 dark:text-amber-300',
		iconBg: 'bg-amber-100 dark:bg-amber-950/50',
		iconFg: 'text-amber-700 dark:text-amber-300',
	},
	danger: {
		border: 'border-red-200 dark:border-red-900',
		text: 'text-red-700 dark:text-red-300',
		iconBg: 'bg-red-100 dark:bg-red-950/50',
		iconFg: 'text-red-700 dark:text-red-300',
	},
} as const;

/** Generic titled card used to host charts / tables on the dashboard. */
export function PanelCard({
	title,
	description,
	action,
	children,
	className = '',
}: {
	title: string;
	description?: string;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section
			className={
				'rounded-xl border border-black/[.06] bg-white p-4 shadow-sm dark:border-white/[.08] dark:bg-zinc-950 ' +
				className
			}
		>
			<header className='mb-3 flex items-start justify-between gap-3'>
				<div>
					<h2 className='text-sm font-semibold tracking-tight'>{title}</h2>
					{description ? (
						<p className='text-xs text-zinc-500 dark:text-zinc-400'>
							{description}
						</p>
					) : null}
				</div>
				{action}
			</header>
			{children}
		</section>
	);
}
