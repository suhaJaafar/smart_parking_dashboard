import { notFound, redirect } from 'next/navigation';

import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { getUser } from '@/app/lib/users/api';
import { canManageUsers } from '@/app/lib/users/permissions';

import { EditUserForm } from './edit-user-form';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
	await requireAuth();
	const actor = (await getCurrentUser())!;
	if (!canManageUsers(actor)) redirect('/dashboard');

	const { id } = await params;
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
	const rolesCsv = (user.roles ?? []).map((r) => r.role).join(',');

	return (
		<div className='max-w-2xl space-y-4'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Edit {user.name}
				</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Update profile, password and role assignments.
				</p>
			</div>
			<EditUserForm
				id={user.id}
				initial={{
					name: user.name,
					email: user.email,
					phone_number: user.phone_number ?? '',
					roles: rolesCsv,
				}}
			/>
		</div>
	);
}
