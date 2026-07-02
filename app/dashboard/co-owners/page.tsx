import { redirect } from 'next/navigation';

import { Pagination } from '@/app/components/pagination';
import { CoOwnersTable } from '@/app/dashboard/co-owners/co-owners-table';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { listCoOwnerRequests } from '@/app/lib/co-owners/api';
import { canManageCoOwners } from '@/app/lib/co-owners/permissions';

interface PageProps {
	searchParams: Promise<{ page?: string; error?: string; ok?: string }>;
}

const BASE_PATH = '/dashboard/co-owners';

/**
 * SPACE_OWNER surface for reviewing co-owner requests.
 *
 * People ask to help manage a specific garage from the Telegram bot; the
 * owner approves (linking their Telegram to this account) or rejects here.
 * Lower-privileged users are bounced home so they never see a 403 page; the
 * backend also enforces this independently.
 */
export default async function CoOwnersPage({ searchParams }: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	if (!canManageCoOwners(user)) redirect('/dashboard');

	const { page, error, ok } = await searchParams;
	const pageNumber = Math.max(1, Number(page) || 1);

	const res = await listCoOwnerRequests({ page: pageNumber, perPage: 20 });

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>Space owners</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Review people asking to help manage your garages. Approving lets them
					control the garage from Telegram.
				</p>
			</div>

			{ok ? (
				<p className='rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'>
					{successMessage(ok)}
				</p>
			) : null}

			{error ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{errorMessage(error)}
				</p>
			) : null}

			{!res.ok ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{res.error?.message ?? 'Failed to load requests.'}
				</p>
			) : res.data.data.length === 0 ? (
				<EmptyState />
			) : (
				<CoOwnersTable requests={res.data.data} />
			)}

			{res.ok ? (
				<Pagination
					current={res.data.meta.current_page}
					last={res.data.meta.last_page}
					basePath={BASE_PATH}
				/>
			) : null}
		</div>
	);
}

function EmptyState() {
	return (
		<div className='rounded-xl border border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-950'>
			<p className='text-sm font-medium text-zinc-700 dark:text-zinc-300'>
				No pending requests
			</p>
			<p className='mx-auto mt-1 max-w-md text-sm text-zinc-500 dark:text-zinc-400'>
				When someone asks to help manage one of your garages from the Telegram
				bot, their request shows up here for you to approve or reject.
			</p>
		</div>
	);
}

function successMessage(code: string): string {
	switch (code) {
		case 'approved':
			return 'Request approved — the person can now manage the garage from Telegram.';
		case 'rejected':
			return 'Request rejected — the person has been notified.';
		default:
			return 'Done.';
	}
}

function errorMessage(code: string): string {
	switch (code) {
		case 'forbidden':
			return 'You are not allowed to perform that action.';
		case 'not_found':
			return 'That request no longer exists — it may have been handled already.';
		case 'approve_failed':
			return 'Could not approve the request. Please try again.';
		case 'reject_failed':
			return 'Could not reject the request. Please try again.';
		default:
			return 'Something went wrong.';
	}
}
