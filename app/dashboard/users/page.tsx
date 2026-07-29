import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Pagination } from '@/app/components/pagination';
import { UsersTable } from '@/app/dashboard/users/users-table';
import { actionErrorMessage } from '@/app/lib/action-errors';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { getPageStartIndex } from '@/app/lib/table-index';
import { listUsers } from '@/app/lib/users/api';
import { canManageUsers } from '@/app/lib/users/permissions';

interface PageProps {
	searchParams: Promise<{ page?: string; error?: string }>;
}

/**
 * SUPER_ADMIN-only user management index.
 *
 * Lower-privileged users are bounced to the dashboard home so they never see
 * a 403 page; the backend also enforces this independently.
 */
export default async function UsersPage({ searchParams }: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	if (!canManageUsers(user)) redirect('/dashboard');

	const { page, error } = await searchParams;
	const pageNumber = Math.max(1, Number(page) || 1);

	const res = await listUsers({ page: pageNumber, perPage: 20 });

	return (
		<div className='space-y-6'>
			<div className='flex items-end justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>Users</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						Manage every account on the platform.
					</p>
				</div>
				<Link
					href='/dashboard/users/new'
					className='inline-flex h-9 items-center rounded-md bg-foreground px-3 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]'
				>
					New user
				</Link>
			</div>

			{error ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{actionErrorMessage(error, 'user')}
				</p>
			) : null}

			{!res.ok ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{res.error?.message ?? 'Failed to load users.'}
				</p>
			) : res.data.data.length === 0 ? (
				<p className='rounded-md border border-zinc-200 bg-white px-3 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'>
					No users yet.
				</p>
			) : (
				<UsersTable
					users={res.data.data}
					currentUserId={user.id}
					startIndex={getPageStartIndex(
						res.data.meta.current_page,
						res.data.meta.per_page,
					)}
				/>
			)}

			{res.ok ? (
				<Pagination
					current={res.data.meta.current_page}
					last={res.data.meta.last_page}
					basePath='/dashboard/users'
				/>
			) : null}
		</div>
	);
}
