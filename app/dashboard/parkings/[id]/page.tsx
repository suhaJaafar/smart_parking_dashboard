import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DataList, DataListItem } from '@/app/components/data-list';
import { DeleteParkButton } from '@/app/dashboard/parkings/delete-park-button';
import { getCurrentUser, requireAuth } from '@/app/lib/auth/dal';
// import { EMPTY, or } from '@/app/lib/format';
import { formatLocationName } from '@/app/lib/locations/format';
import { getPark } from '@/app/lib/parks/api';
import { canManagePark } from '@/app/lib/parks/permissions';

interface PageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ error?: string }>;
}

export default async function ParkingDetailPage({
	params,
	searchParams,
}: PageProps) {
	await requireAuth();
	const user = (await getCurrentUser())!;
	const { id } = await params;
	const { error } = await searchParams;

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
	const canManage = canManagePark(user, park);
	const loc = park.location;
	const cars = park.cars ?? [];
	const occupied = Math.max(park.capacity - park.free_spaces, 0);

	return (
		<div className='space-y-6'>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight'>{park.name}</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						{park.free_spaces} / {park.capacity} free spaces
					</p>
				</div>

				{canManage ? (
					<div className='flex items-center gap-2 text-sm'>
						<Link
							href={`/dashboard/parkings/${park.id}/edit`}
							className='inline-flex  px-2 py-1 text-xs items-center rounded-md border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
						>
							Edit
						</Link>
						<DeleteParkButton id={park.id} name={park.name} />
					</div>
				) : null}
			</div>

			{error ? (
				<p className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
					{error === 'forbidden'
						? 'You are not allowed to perform that action.'
						: error === 'delete_failed'
							? 'Failed to delete the parking.'
							: 'Something went wrong.'}
				</p>
			) : null}

			<section className='rounded-xl border border-black/[.06] bg-white p-5 dark:border-white/[.08] dark:bg-zinc-950'>
				<h2 className='text-sm font-semibold'>Location</h2>
				<DataList className='mt-3'>
					<DataListItem label='Address' value={formatLocationName(loc)} full />
					<DataListItem label='Country' value={loc?.country?.label ?? '_'} />
					<DataListItem label='State' value={loc?.state?.label ?? '_'} />
					<DataListItem label='City' value={loc?.city ?? '_'} />
					<DataListItem label='Postal code' value={loc?.postal_code ?? '_'} />
					{loc?.extra_details ? (
						<DataListItem label='Notes' value={loc.extra_details} full />
					) : null}
				</DataList>
			</section>

			<section className='rounded-xl border border-black/[.06] bg-white p-5 dark:border-white/[.08] dark:bg-zinc-950'>
				<div className='flex items-center justify-between gap-3'>
					<h2 className='text-sm font-semibold'>Reserved cars</h2>
					<span className='inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400'>
						<span className='font-medium text-zinc-900 dark:text-zinc-100'>
							{cars.length}
						</span>
						<span>/ {park.capacity}</span>
					</span>
				</div>
				<p className='mt-1 text-xs text-zinc-500'>
					{occupied} occupied · {park.free_spaces} free
				</p>

				{cars.length === 0 ? (
					<div className='mt-4 rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800'>
						No cars are currently reserved in this park.
					</div>
				) : (
					<ul className='mt-4 divide-y divide-zinc-100 dark:divide-zinc-900'>
						{cars.map((car) => {
							const plate = [car.plate_prefix, car.car_number]
								.filter(Boolean)
								.join(' ');
							const phone = car.user?.phone_number ?? null;
							return (
								<li
									key={car.id}
									className='flex items-center justify-between gap-4 py-3'
								>
									<div className='min-w-0'>
										<dt className='text-xs uppercase tracking-wide text-zinc-500'>
											Car number
										</dt>
										<dd className='mt-0.5 font-mono text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-100'>
											{plate || '—'}
										</dd>
									</div>
									<div className='min-w-0 text-right'>
										<dt className='text-xs uppercase tracking-wide text-zinc-500'>
											Owner phone
										</dt>
										<dd className='mt-0.5 text-sm'>
											{phone ? (
												<a
													href={`tel:${phone}`}
													className='font-mono text-zinc-900 hover:underline dark:text-zinc-100'
												>
													{phone}
												</a>
											) : (
												<span className='text-zinc-400'>—</span>
											)}
										</dd>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</div>
	);
}
