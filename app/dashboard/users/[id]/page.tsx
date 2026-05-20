import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { DataList, DataListItem } from '@/app/components/data-list';
import { DeleteUserButton } from '@/app/dashboard/users/delete-user-button';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { getUser } from '@/app/lib/users/api';
import { canManageUsers } from '@/app/lib/users/permissions';
import { ROLE_LABEL } from '@/app/types/role';

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ error?: string }>;
}

export default async function UserDetailPage({
	params,
	searchParams,
}: PageProps) {
	await requireAuth();
	const actor = (await getCurrentUser())!;
	if (!canManageUsers(actor)) redirect('/dashboard');

	const { id } = await params;
	const { error } = await searchParams;

	const res = await getUser(id);
	if (!res.ok && res.status === 404) notFound();
	if (!res.ok) {
		return (
			<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
				{res.error?.message ?? 'Failed to load user.'}
			</p>
		);
	}

	const user = res.data.data;
	const isSelf = user.id === actor.id;
	const roles = (user.roles ?? [])
		.map((r) => ROLE_LABEL[r.role] ?? String(r.role))
		.join(', ');

	return (
		<div className='space-y-6'>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>{user.name}</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						{user.email}
					</p>
				</div>

				<div className='flex items-center gap-2 text-sm'>
					<Link
						href={`/dashboard/users/${user.id}/edit`}
						className='inline-flex px-2 py-1 text-xs items-center rounded-md border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
					>
						Edit
					</Link>
					<DeleteUserButton
						id={user.id}
						name={user.name}
						disabled={isSelf}
						disabledReason='You cannot delete your own account.'
					/>
				</div>
			</div>

			{error ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{error === 'forbidden'
						? 'You are not allowed to perform that action.'
						: error === 'delete_failed'
							? 'Failed to delete the user.'
							: 'Something went wrong.'}
				</p>
			) : null}

			<section className='rounded-xl border border-black/[.06] bg-white p-5 dark:border-white/[.08] dark:bg-zinc-950'>
				<h2 className='text-sm font-semibold'>Profile</h2>
				<DataList className='mt-3'>
					<DataListItem label='Name' value={user.name} />
					<DataListItem label='Email' value={user.email} />
					<DataListItem label='Phone' value={user.phone_number ?? '—'} />
					<DataListItem label='Roles' value={roles || '—'} full />
				</DataList>
			</section>
		</div>
	);
}
