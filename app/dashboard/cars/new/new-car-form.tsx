'use client';

import { useActionState } from 'react';

import {
	Field,
	Fieldset,
	FormErrorBanner,
	Select,
	SubmitButton,
} from '@/app/components/form';
import { createOwnerCarAction } from '@/app/lib/cars/actions';
import type {
	CreateOwnerCarFormState,
	CreateOwnerCarFormValues,
} from '@/app/lib/cars/forms';

const initialState: CreateOwnerCarFormState = {};

/** A garage the owner can park a car into. */
export interface GarageOption {
	id: string;
	name: string;
	freeSpaces: number;
}

export function NewCarForm({ garages }: { garages: readonly GarageOption[] }) {
	const [state, action, pending] = useActionState(
		createOwnerCarAction,
		initialState,
	);
	const v: Partial<CreateOwnerCarFormValues> = state?.values ?? {};
	const err = state?.errors;

	return (
		<form action={action} className='flex flex-col gap-4'>
			<FormErrorBanner message={state?.message} />

			<Fieldset title='Garage'>
				<Select
					label='Park the car into'
					name='park_id'
					defaultValue={v.park_id ?? ''}
					error={err?.park_id?.[0]}
					placeholder='Select a garage…'
					required
					options={garages.map((g) => ({
						value: g.id,
						label: `${g.name} (${g.freeSpaces} free)`,
					}))}
				/>
			</Fieldset>

			<Fieldset title='Car'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field
						label='Plate prefix'
						name='plate_prefix'
						hint='Governorate / region code, e.g. بغداد.'
						defaultValue={v.plate_prefix ?? ''}
						error={err?.plate_prefix?.[0]}
						maxLength={8}
						required
					/>
					<Field
						label='Car number'
						name='car_number'
						defaultValue={v.car_number ?? ''}
						error={err?.car_number?.[0]}
						maxLength={20}
						required
					/>
				</div>
				<Field
					label='Model'
					hint='Optional — e.g. Toyota Corolla.'
					name='model'
					defaultValue={v.model ?? ''}
					error={err?.model?.[0]}
					maxLength={50}
				/>
			</Fieldset>

			<SubmitButton
				pending={pending}
				idleLabel='Add car'
				pendingLabel='Adding…'
			/>
		</form>
	);
}
