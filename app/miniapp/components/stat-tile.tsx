/** Tone drives the accent colour of the value. */
type StatTone = 'neutral' | 'positive' | 'accent' | 'danger';

const TONE_COLOR: Record<StatTone, string> = {
	neutral: 'var(--sp-text)',
	positive: '#22c55e',
	// Not `--sp-accent`: that is a fill colour and only reaches 3.1:1 as text.
	accent: 'var(--sp-accent-strong)',
	danger: 'var(--sp-danger)',
};

/**
 * Compact metric tile for the two-column summary grid.
 *
 * A server component — it holds no state and never needs an event handler, so
 * it stays out of the client bundle entirely.
 */
export function StatTile({
	label,
	value,
	tone = 'neutral',
}: {
	label: string;
	value: string;
	tone?: StatTone;
}) {
	return (
		<div className='sp-card px-4 py-3.5'>
			<p
				className='truncate text-xs font-medium'
				style={{ color: 'var(--sp-muted)' }}
			>
				{label}
			</p>
			<p
				className='mt-1.5 text-2xl font-bold leading-none tabular-nums'
				style={{ color: TONE_COLOR[tone] }}
			>
				{value}
			</p>
		</div>
	);
}
