import { redirect } from 'next/navigation';

import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { canManageOwnerCars } from '@/app/lib/cars/permissions';
import { listMyParks } from '@/app/lib/parks/api';

import { NewCarForm, type GarageOption } from './new-car-form';

export default async function NewCarPage() {
	await requireAuth();
	const user = (await getCurrentUser())!;
	if (!canManageOwnerCars(user)) redirect('/dashboard');

	const parks = await loadGarageOptions();

	return (
		<div className='max-w-2xl space-y-4'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>Add car</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Record a car that entered one of your garages. Its slot is reserved
					automatically, keeping your free-space count accurate.
				</p>
			</div>

			{parks.length === 0 ? (
				<p className='rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'>
					You need at least one garage before you can add a car. Create a
					parking first.
				</p>
			) : (
				<NewCarForm garages={parks} />
			)}
		</div>
	);
}

async function loadGarageOptions(): Promise<GarageOption[]> {
	const res = await listMyParks(1);
	if (!res.ok) return [];
	return res.data.data.map((p) => ({
		id: p.id,
		name: p.name,
		freeSpaces: p.free_spaces,
	}));
}
