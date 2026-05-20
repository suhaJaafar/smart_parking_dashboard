import { requireAuth } from '@/app/lib/auth/dal';
import { canAssignParkOwner, canCreatePark } from '@/app/lib/parks/permissions';
import { listUsers } from '@/app/lib/users/api';

import { NewParkForm, type OwnerOption } from './new-park-form';

export default async function NewParkingPage() {
	const user = await requireAuth();
	if (!canCreatePark(user)) {
		return (
			<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
				You are not allowed to create a parking.
			</p>
		);
	}

	const owners: OwnerOption[] | null = canAssignParkOwner(user)
		? await loadOwnerOptions()
		: null;

	return (
		<div className='max-w-2xl space-y-4'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>New parking</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					{owners
						? 'Pick the user that should own this parking. They will be granted the Space owner role automatically.'
						: 'Creating a parking will mark you as a space owner.'}
				</p>
			</div>
			<NewParkForm owners={owners} />
		</div>
	);
}

async function loadOwnerOptions(): Promise<OwnerOption[]> {
	const res = await listUsers({ perPage: 100 });
	if (!res.ok) return [];
	return res.data.data.map((u) => ({
		id: u.id,
		name: u.name,
		email: u.email,
	}));
}
