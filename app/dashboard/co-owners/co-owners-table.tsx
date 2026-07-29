import { RequestActions } from '@/app/dashboard/co-owners/request-actions';
import type { CoOwnerRequest } from '@/app/types/co-owner';

/**
 * Tabular view of pending co-owner requests for the signed-in space owner.
 *
 * Each row surfaces who is asking, how to reach them, which garage they want
 * to help manage, and Approve / Reject controls. Only pending requests are
 * listed — decided ones drop off after the owner acts.
 */
export function CoOwnersTable({
	requests,
	startIndex = 1,
}: {
	requests: readonly CoOwnerRequest[];
	startIndex?: number;
}) {
	return (
		<div className='overflow-x-auto rounded-xl border border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950'>
			<table className='w-full text-sm'>
				<thead className='bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60'>
					<tr>
						<th className='w-16 px-4 py-3 font-medium'>No.</th>
						<th className='px-4 py-3 font-medium'>Name</th>
						<th className='px-4 py-3 font-medium'>Phone</th>
						<th className='px-4 py-3 font-medium'>Requested garage</th>
						<th className='px-4 py-3 font-medium'>Requested</th>
						<th
							className='px-4 py-3 text-right font-medium'
							aria-label='Actions'
						/>
					</tr>
				</thead>
				<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
					{requests.map((r, rowIndex) => (
						<Row key={r.id} request={r} index={startIndex + rowIndex} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function Row({ request, index }: { request: CoOwnerRequest; index: number }) {
	const parkName = request.park?.name ?? null;

	return (
		<tr className='hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40'>
			<td className='px-4 py-3 text-sm tabular-nums text-zinc-500 dark:text-zinc-400'>
				{index}
			</td>
			<td className='px-4 py-3 font-medium'>{request.requester_name}</td>
			<td className='px-4 py-3 text-zinc-700 dark:text-zinc-300'>
				<a
					href={`tel:${request.requester_phone}`}
					className='tabular-nums hover:underline'
					dir='ltr'
				>
					{request.requester_phone}
				</a>
			</td>
			<td className='px-4 py-3'>
				{parkName ? (
					<span className='inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'>
						{parkName}
					</span>
				) : (
					<span className='text-xs text-zinc-500'>—</span>
				)}
			</td>
			<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
				{formatTimestamp(request.created_at)}
			</td>
			<td className='px-4 py-3'>
				<RequestActions
					id={request.id}
					name={request.requester_name}
					park={parkName}
				/>
			</td>
		</tr>
	);
}

/** Render an ISO-8601 timestamp as a readable date + time, or a dash. */
function formatTimestamp(iso: string | null | undefined): string {
	if (!iso) return '—';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return '—';
	return new Intl.DateTimeFormat('en', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(date);
}
