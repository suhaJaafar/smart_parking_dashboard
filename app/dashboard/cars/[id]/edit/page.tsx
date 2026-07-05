import { notFound, redirect } from 'next/navigation';

import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { getOwnerCar } from '@/app/lib/cars/api';
import { canManageOwnerCars } from '@/app/lib/cars/permissions';

import { EditCarForm } from './edit-car-form';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function EditCarPage({ params }: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	if (!canManageOwnerCars(user)) redirect('/dashboard');

	const { id } = await params;

	const res = await getOwnerCar(id);
	if (!res.ok && res.status === 404) notFound();
	if (!res.ok) {
		return (
			<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
				{res.error?.message ?? 'Failed to load car.'}
			</p>
		);
	}

	const car = res.data.data;

	return (
		<div className='max-w-2xl space-y-4'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Edit <span className='font-mono tracking-wider'>{car.plate}</span>
				</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					{car.park?.name
						? `Parked in ${car.park.name}. To move it, remove it here and add it to the other garage.`
						: 'To move a car between garages, remove it and add it to the other garage.'}
				</p>
			</div>
			<EditCarForm
				id={car.id}
				initial={{
					plate_prefix: car.plate_prefix ?? '',
					car_number: car.car_number,
					model: car.model ?? '',
				}}
			/>
		</div>
	);
}
