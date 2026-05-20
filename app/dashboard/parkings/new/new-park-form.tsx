'use client';

import { useActionState, useEffect, useState } from 'react';

import {
	Field,
	FieldErrorList,
	Fieldset,
	FormErrorBanner,
	Select,
	SubmitButton,
	Textarea,
} from '@/app/components/form';
import { LocationPicker, type PickedLocation } from '@/app/components/map';
import { LocationHeadline } from '@/app/dashboard/parkings/new/location-headline';
import { createParkAction } from '@/app/lib/parks/actions';
import type {
	CreateParkFormState,
	CreateParkFormValues,
} from '@/app/lib/parks/forms';
import { COUNTRY_OPTIONS } from '@/app/types/country';
import { STATE_OPTIONS } from '@/app/types/state';

const initialState: CreateParkFormState = {};

/**
 * Slim user projection used to populate the SUPER_ADMIN owner picker.
 * Kept local to this feature so the form stays decoupled from `User`.
 */
export interface OwnerOption {
	id: string;
	name: string;
	email: string;
}

export function NewParkForm({ owners }: { owners: OwnerOption[] | null }) {
	const [state, action, pending] = useActionState(
		createParkAction,
		initialState,
	);
	const v: Partial<CreateParkFormValues> = state?.values ?? {};
	const err = state?.errors;

	const [capacity, setCapacity] = useState(v.capacity ?? '');
	const [freeSpaces, setFreeSpaces] = useState(v.free_spaces ?? '');
	const [freeSpacesTouched, setFreeSpacesTouched] = useState(
		Boolean(v.free_spaces),
	);
	useEffect(() => {
		if (!freeSpacesTouched) setFreeSpaces(capacity);
	}, [capacity, freeSpacesTouched]);

	const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
		v.latitude && v.longitude
			? { lat: Number(v.latitude), lng: Number(v.longitude) }
			: null,
	);
	const [country, setCountry] = useState(v.country ?? '');
	const [stateValue, setStateValue] = useState(v.state ?? '');
	const [city, setCity] = useState(v.city ?? '');
	const [postalCode, setPostalCode] = useState(v.postal_code ?? '');
	const [displayName, setDisplayName] = useState('');

	const handlePick = (picked: PickedLocation) => {
		setCoords({ lat: picked.latitude, lng: picked.longitude });
		setCountry(String(picked.country));
		setStateValue(picked.state != null ? String(picked.state) : '');
		setCity(picked.city ?? '');
		setPostalCode(picked.postal_code ?? '');
		setDisplayName(picked.display_name ?? '');
	};

	return (
		<form action={action} className='flex flex-col gap-4'>
			<FormErrorBanner message={state?.message} />

			{owners ? (
				<Fieldset
					title='Owner'
					description='Assign this parking to a user. They will be granted the Space owner role automatically if they don’t already have it.'
				>
					<Select
						label='Space owner'
						name='user_id'
						defaultValue={v.user_id ?? ''}
						error={err?.user_id?.[0]}
						placeholder='Select a user…'
						required
						options={owners.map((o) => ({
							value: o.id,
							label: `${o.name} (${o.email})`,
						}))}
					/>
				</Fieldset>
			) : null}

			<Fieldset title='Parking'>
				<Field
					label='Name'
					name='name'
					defaultValue={v.name ?? ''}
					error={err?.name?.[0]}
					required
				/>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field
						label='Capacity'
						name='capacity'
						type='number'
						min={1}
						value={capacity}
						onChange={(e) => setCapacity(e.currentTarget.value)}
						error={err?.capacity?.[0]}
						required
					/>
					<Field
						label='Free spaces'
						hint='Defaults to the same as capacity.'
						name='free_spaces'
						type='number'
						min={0}
						value={freeSpaces}
						onChange={(e) => {
							setFreeSpacesTouched(true);
							setFreeSpaces(e.currentTarget.value);
						}}
						error={err?.free_spaces?.[0]}
					/>
				</div>
			</Fieldset>

			<Fieldset
				title='Location'
				description='Click on the map to drop a pin. Country, state, city and postal code are pre-filled from the pin — adjust them if anything is missing or wrong.'
			>
				<LocationPicker value={coords} onPick={handlePick} />

				<LocationHeadline coords={coords} displayName={displayName} />

				<div className='grid gap-4 sm:grid-cols-2'>
					<Select
						label='Country'
						name='country'
						value={country}
						onChange={(e) => setCountry(e.currentTarget.value)}
						error={err?.country?.[0]}
						options={COUNTRY_OPTIONS}
						required
					/>
					<Select
						label='State'
						name='state'
						value={stateValue}
						onChange={(e) => setStateValue(e.currentTarget.value)}
						error={err?.state?.[0]}
						options={STATE_OPTIONS}
						required
					/>
					<Field
						label='City'
						name='city'
						value={city}
						onChange={(e) => setCity(e.currentTarget.value)}
						error={err?.city?.[0]}
					/>
					<Field
						label='Postal code'
						name='postal_code'
						value={postalCode}
						onChange={(e) => setPostalCode(e.currentTarget.value)}
						error={err?.postal_code?.[0]}
					/>
				</div>

				{/* Lat/lng come strictly from the map — not user-editable. */}
				<input
					type='hidden'
					name='latitude'
					value={coords ? coords.lat.toString() : ''}
				/>
				<input
					type='hidden'
					name='longitude'
					value={coords ? coords.lng.toString() : ''}
				/>

				<FieldErrorList errors={[err?.latitude?.[0], err?.longitude?.[0]]} />

				<Textarea
					label='Notes'
					name='extra_details'
					defaultValue={v.extra_details ?? ''}
					error={err?.extra_details?.[0]}
				/>
			</Fieldset>

			<SubmitButton
				pending={pending}
				idleLabel='Create parking'
				pendingLabel='Creating…'
			/>
		</form>
	);
}
