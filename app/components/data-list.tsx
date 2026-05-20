import type { ReactNode } from 'react';

/**
 * Read-only key/value list, rendered as a semantic `<dl>` grid.
 *
 * Use this for any "details" or "summary" panel where you would otherwise
 * hand-write `<dl><dt/><dd/></dl>` rows. Keeps spacing, typography, and the
 * full-row span behaviour consistent across the dashboard.
 *
 * @example
 *   <DataList>
 *     <DataListItem label="Name" value={user.name} />
 *     <DataListItem label="Notes" value={user.notes} full />
 *   </DataList>
 */
export function DataList({
	children,
	className = '',
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<dl className={`grid gap-3 text-sm sm:grid-cols-2 ${className}`.trimEnd()}>
			{children}
		</dl>
	);
}

export function DataListItem({
	label,
	value,
	full = false,
}: {
	label: string;
	value: ReactNode;
	/** Span both columns on the `sm:` breakpoint and up. */
	full?: boolean;
}) {
	return (
		<div className={full ? 'sm:col-span-2' : undefined}>
			<dt className='text-xs uppercase tracking-wide text-zinc-500'>{label}</dt>
			<dd className='mt-0.5'>{value}</dd>
		</div>
	);
}
