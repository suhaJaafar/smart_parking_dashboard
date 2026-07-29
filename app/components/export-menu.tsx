'use client';

import { useRef, useState } from 'react';

/**
 * Reusable "Export to Excel" control.
 *
 * Opens a small popover with an optional From / To date range, then triggers
 * a download from `endpoint` (a same-origin Next.js route handler that proxies
 * the authenticated CSV stream from the Laravel API). Because the response is
 * served with `Content-Disposition: attachment`, the browser downloads the
 * file without navigating away — the user stays exactly where they are.
 *
 * `extraParams` carries context the export must respect (garage, status
 * filter…). Undefined / empty values are dropped so the URL stays clean.
 */
export function ExportMenu({
	endpoint,
	label = 'Export Excel',
	extraParams,
	align = 'right',
}: {
	endpoint: string;
	label?: string;
	extraParams?: Record<string, string | undefined>;
	align?: 'left' | 'right';
}) {
	const [open, setOpen] = useState(false);
	const [from, setFrom] = useState('');
	const [to, setTo] = useState('');
	const anchorRef = useRef<HTMLDivElement>(null);

	function download() {
		const params = new URLSearchParams();
		if (extraParams) {
			for (const [key, value] of Object.entries(extraParams)) {
				if (value !== undefined && value !== '') params.set(key, value);
			}
		}
		if (from) params.set('from', from);
		if (to) params.set('to', to);

		const qs = params.toString();
		// Attachment response → downloads without leaving the page.
		window.location.href = qs ? `${endpoint}?${qs}` : endpoint;
		setOpen(false);
	}

	return (
		<div ref={anchorRef} className='relative inline-block'>
			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				aria-haspopup='dialog'
				aria-expanded={open}
				className='inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-300 px-3 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
			>
				<DownloadIcon />
				{label}
			</button>

			{open ? (
				<>
					{/* Click-away backdrop */}
					<div
						className='fixed inset-0 z-40'
						aria-hidden='true'
						onClick={() => setOpen(false)}
					/>
					<div
						role='dialog'
						aria-label='Export options'
						className={`absolute z-50 mt-2 w-64 rounded-xl border border-black/[.08] bg-white p-4 shadow-xl dark:border-white/[.12] dark:bg-zinc-950 ${
							align === 'right' ? 'right-0' : 'left-0'
						}`}
					>
						<p className='text-sm font-semibold'>Export to Excel</p>
						<p className='mt-0.5 text-xs text-zinc-500 dark:text-zinc-400'>
							Optionally limit to a date range. Leave blank to export
							everything.
						</p>

						<div className='mt-3 space-y-2'>
							<label className='flex flex-col gap-1 text-xs'>
								<span className='font-medium text-zinc-600 dark:text-zinc-400'>
									From
								</span>
								<input
									type='date'
									value={from}
									max={to || undefined}
									onChange={(e) => setFrom(e.target.value)}
									className='rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950'
								/>
							</label>
							<label className='flex flex-col gap-1 text-xs'>
								<span className='font-medium text-zinc-600 dark:text-zinc-400'>
									To
								</span>
								<input
									type='date'
									value={to}
									min={from || undefined}
									onChange={(e) => setTo(e.target.value)}
									className='rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950'
								/>
							</label>
						</div>

						<div className='mt-4 flex items-center justify-end gap-2'>
							<button
								type='button'
								onClick={() => setOpen(false)}
								className='rounded-md border border-zinc-300 px-3 py-1.5 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
							>
								Cancel
							</button>
							<button
								type='button'
								onClick={download}
								className='inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700'
							>
								<DownloadIcon />
								Download
							</button>
						</div>
					</div>
				</>
			) : null}
		</div>
	);
}

function DownloadIcon() {
	return (
		<svg
			width='14'
			height='14'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
		>
			<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
			<polyline points='7 10 12 15 17 10' />
			<line x1='12' y1='15' x2='12' y2='3' />
		</svg>
	);
}
