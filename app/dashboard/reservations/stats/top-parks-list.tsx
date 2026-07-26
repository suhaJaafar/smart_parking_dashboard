import Link from 'next/link';

import { formatDurationMinutes } from '@/app/lib/reservation-stats/format';
import type { ReservationByPark } from '@/app/types/reservation-stats';

/**
 * Ranked list of parks by reservation volume, together with average
 * completed-stay duration. Complements the top-parks bar chart with the
 * exact numbers + a deep-link into each garage's reservations page.
 */
export function TopParksList({
	parks,
}: {
	parks: readonly ReservationByPark[];
}) {
	if (parks.length === 0) {
		return (
			<p className='text-sm text-zinc-500 dark:text-zinc-400'>
				No parks had activity in this window.
			</p>
		);
	}

	const max = parks.reduce((acc, p) => Math.max(acc, p.count), 0);

	return (
		<ol className='divide-y divide-zinc-100 dark:divide-zinc-800'>
			{parks.map((p, i) => {
				const pct = max > 0 ? Math.round((p.count / max) * 100) : 0;
				return (
					<li
						key={p.park_id}
						className='flex items-center justify-between gap-3 py-2.5'
					>
						<div className='flex min-w-0 items-center gap-3'>
							<span className='w-5 shrink-0 text-right text-xs tabular-nums text-zinc-400'>
								{i + 1}
							</span>
							<div className='min-w-0'>
								<Link
									href={`/dashboard/reservations?park_id=${p.park_id}`}
									className='block truncate text-sm font-medium hover:underline'
								>
									{p.name}
								</Link>
								<div className='mt-1 h-1 w-full max-w-[220px] overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900'>
									<div
										className='h-full rounded-full bg-amber-400 dark:bg-amber-500'
										style={{ width: `${pct}%` }}
									/>
								</div>
								<p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
									Avg stay: {formatDurationMinutes(p.avg_duration_minutes)}
								</p>
							</div>
						</div>
						<div className='shrink-0 text-right'>
							<p className='text-sm font-semibold tabular-nums'>
								{p.count.toLocaleString()}
							</p>
							<p className='text-[11px] text-zinc-500'>reservations</p>
						</div>
					</li>
				);
			})}
		</ol>
	);
}
