import { redirect } from 'next/navigation';

import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { listParkApprovals } from '@/app/lib/park-approvals/api';
import { canReviewParks } from '@/app/lib/park-approvals/permissions';
import type { ParkApprovalStatus } from '@/app/types/park';

import { ApprovalActions } from './approval-actions';

interface PageProps {
	searchParams: Promise<{
		status?: string;
		error?: string;
		ok?: string;
	}>;
}

const BASE_PATH = '/dashboard/park-approvals';

const TABS: { value: ParkApprovalStatus; label: string }[] = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' },
];

/**
 * Admin review queue for newly registered garages.
 *
 * Owners are promised a decision within 24 hours, so the backend returns this
 * queue oldest-first — the row closest to breaking that promise is the one on
 * top. Lower-privileged users are bounced home rather than shown a 403; the
 * backend enforces the same rule independently.
 */
export default async function ParkApprovalsPage({ searchParams }: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	if (!canReviewParks(user)) redirect('/dashboard');

	const { status, error, ok } = await searchParams;
	const active: ParkApprovalStatus = TABS.some((t) => t.value === status)
		? (status as ParkApprovalStatus)
		: 'pending';

	const res = await listParkApprovals({ status: active, perPage: 20 });
	const parks = res.ok ? res.data.data : [];

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Garage approvals
				</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Newly registered garages stay hidden from drivers until reviewed.
					Approving publishes the garage and grants its owner the space-owner
					role.
				</p>
			</div>

			<nav className='flex gap-1 border-b border-zinc-200 dark:border-zinc-800'>
				{TABS.map((tab) => (
					<a
						key={tab.value}
						href={`${BASE_PATH}?status=${tab.value}`}
						aria-current={tab.value === active ? 'page' : undefined}
						className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
							tab.value === active
								? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
								: 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
						}`}
					>
						{tab.label}
					</a>
				))}
			</nav>

			{ok ? (
				<p className='rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'>
					{ok === 'approved'
						? 'Garage approved. The owner has been notified.'
						: 'Garage rejected. The owner has been notified.'}
				</p>
			) : null}

			{error ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{errorMessage(error)}
				</p>
			) : null}

			{!res.ok ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{res.error?.message ?? 'Failed to load garages.'}
				</p>
			) : parks.length === 0 ? (
				<EmptyState status={active} />
			) : (
				<div className='overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800'>
					<table className='w-full text-sm'>
						<thead className='bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'>
							<tr>
								<th className='px-4 py-2.5 font-medium'>Garage</th>
								<th className='px-4 py-2.5 font-medium'>Owner</th>
								<th className='px-4 py-2.5 font-medium'>Capacity</th>
								<th className='px-4 py-2.5 font-medium'>Location</th>
								<th className='px-4 py-2.5 font-medium'>Submitted</th>
								{active === 'pending' ? (
									<th className='px-4 py-2.5 text-right font-medium'>
										Actions
									</th>
								) : null}
							</tr>
						</thead>
						<tbody className='divide-y divide-zinc-200 dark:divide-zinc-800'>
							{parks.map((park) => (
								<tr key={park.id}>
									<td className='px-4 py-3 font-medium'>{park.name}</td>
									<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
										{park.owner?.name ?? '—'}
									</td>
									<td className='px-4 py-3 tabular-nums'>{park.capacity}</td>
									<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
										{[park.location?.city, park.location?.state]
											.filter(Boolean)
											.join(', ') || '—'}
									</td>
									<td className='px-4 py-3 text-zinc-600 dark:text-zinc-400'>
										{park.created_at
											? new Date(park.created_at).toLocaleDateString()
											: '—'}
									</td>
									{active === 'pending' ? (
										<td className='px-4 py-3'>
											<ApprovalActions
												id={park.id}
												name={park.name}
												owner={park.owner?.name ?? null}
											/>
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

function EmptyState({ status }: { status: ParkApprovalStatus }) {
	return (
		<div className='rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700'>
			<p className='text-sm text-zinc-600 dark:text-zinc-400'>
				{status === 'pending'
					? 'Nothing waiting for review.'
					: `No ${status} garages.`}
			</p>
		</div>
	);
}

function errorMessage(code: string): string {
	switch (code) {
		case 'forbidden':
			return 'Your account cannot review garages.';
		case 'not_found':
			return 'That garage no longer exists.';
		case 'approve_failed':
			return 'Could not approve the garage. Try again.';
		case 'reject_failed':
			return 'Could not reject the garage. Try again.';
		default:
			return 'Something went wrong.';
	}
}
