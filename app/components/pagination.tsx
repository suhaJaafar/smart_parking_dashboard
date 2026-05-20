import Link from 'next/link';

/**
 * Generic Prev / Next pagination control for paginated list pages.
 *
 * Renders nothing when there is only a single page. The link target is built
 * from `basePath` so each list page passes its own route:
 *
 *   <Pagination current={meta.current_page} last={meta.last_page}
 *               basePath='/dashboard/parkings' />
 */
export function Pagination({
	current,
	last,
	basePath,
}: {
	current: number;
	last: number;
	basePath: string;
}) {
	if (last <= 1) return null;
	return (
		<nav className='flex items-center justify-center gap-2 text-sm'>
			<PageLink
				basePath={basePath}
				page={current - 1}
				disabled={current <= 1}
				label='Previous'
			/>
			<span className='text-zinc-500'>
				Page {current} of {last}
			</span>
			<PageLink
				basePath={basePath}
				page={current + 1}
				disabled={current >= last}
				label='Next'
			/>
		</nav>
	);
}

function PageLink({
	basePath,
	page,
	disabled,
	label,
}: {
	basePath: string;
	page: number;
	disabled: boolean;
	label: string;
}) {
	if (disabled) {
		return (
			<span className='rounded-md border border-zinc-200 px-3 py-1 text-zinc-400 dark:border-zinc-800'>
				{label}
			</span>
		);
	}
	return (
		<Link
			href={`${basePath}?page=${page}`}
			className='rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
		>
			{label}
		</Link>
	);
}
