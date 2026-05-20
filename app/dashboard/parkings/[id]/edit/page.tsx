import { notFound, redirect } from 'next/navigation';

import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
import { getPark } from '@/app/lib/parks/api';
import { canManagePark } from '@/app/lib/parks/permissions';

import { EditParkForm } from './edit-park-form';

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function EditParkingPage({ params }: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	const { id } = await params;

	const res = await getPark(id);
	if (!res.ok && res.status === 404) notFound();
	if (!res.ok) {
		return (
			<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
				{res.error?.message ?? 'Failed to load parking.'}
			</p>
		);
	}

	const park = res.data.data;
	if (!canManagePark(user, park)) {
		redirect(`/dashboard/parkings/${id}?error=forbidden`);
	}

	return (
		<div className='max-w-2xl space-y-4'>
			<div>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Edit {park.name}
				</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Location cannot be changed — delete and re-create the parking to move
					it.
				</p>
			</div>
			<EditParkForm
				id={park.id}
				initial={{
					name: park.name,
					capacity: String(park.capacity),
					free_spaces: String(park.free_spaces),
				}}
			/>
		</div>
	);
}
