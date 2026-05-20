import { redirect } from 'next/navigation';

import { NewUserForm } from '@/app/dashboard/users/new/new-user-form';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { canManageUsers } from '@/app/lib/users/permissions';

export default async function NewUserPage() {
	await requireAuth();
	const user = (await getCurrentUser())!;
	if (!canManageUsers(user)) redirect('/dashboard');

	return (
		<div className='max-w-2xl space-y-4'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>New user</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Create an account and assign one or more roles.
				</p>
			</div>
			<NewUserForm />
		</div>
	);
}
