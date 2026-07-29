import Link from 'next/link';

/**
 * Generic Prev / Next pagination control for paginated list pages.
 *
 * Renders nothing when there is only a single page. The link target is built
 * from `basePath` so each list page passes its own route:
 *
 *   <Pagination current={meta.current_page} last={meta.last_page}
 *               basePath='/dashboard/parkings' />
 *
 * Pass `params` to preserve the active filters (garage, status, date range…)
 * across page changes — without it, navigating to page 2 would drop those
 * filters and silently show a different (often empty) slice. Pass `pageParam`
 * when a route hosts more than one independent paginated list (e.g. the cars
 * page paginates both the current cars and the history).
 */
export function Pagination({
	current,
	last,
	basePath,
	params,
	pageParam = 'page',
}: {
	current: number;
	last: number;
	basePath: string;
	params?: Record<string, string | undefined>;
	pageParam?: string;
}) {
	if (last <= 1) return null;
	return (
		<nav className='flex items-center justify-center gap-2 text-sm'>
			<PageLink
				basePath={basePath}
				page={current - 1}
				disabled={current <= 1}
				label='Previous'
				params={params}
				pageParam={pageParam}
			/>
			<span className='text-zinc-500'>
				Page {current} of {last}
			</span>
			<PageLink
				basePath={basePath}
				page={current + 1}
				disabled={current >= last}
				label='Next'
				params={params}
				pageParam={pageParam}
			/>
		</nav>
	);
}

function PageLink({
	basePath,
	page,
	disabled,
	label,
	params,
	pageParam,
}: {
	basePath: string;
	page: number;
	disabled: boolean;
	label: string;
	params?: Record<string, string | undefined>;
	pageParam: string;
}) {
	if (disabled) {
		return (
			<span className='rounded-md border border-zinc-200 px-3 py-1 text-zinc-400 dark:border-zinc-800'>
				{label}
			</span>
		);
	}

	const search = new URLSearchParams();
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== '') search.set(key, value);
		}
	}
	search.set(pageParam, String(page));

	return (
		<Link
			href={`${basePath}?${search.toString()}`}
			className='rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
		>
			{label}
		</Link>
	);
}
