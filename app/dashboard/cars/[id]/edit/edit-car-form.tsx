'use client';

import { useActionState } from 'react';

import {
	Field,
	Fieldset,
	FormErrorBanner,
	SubmitButton,
} from '@/app/components/form';
import { updateOwnerCarAction } from '@/app/lib/cars/actions';
import type {
	UpdateOwnerCarFormState,
	UpdateOwnerCarFormValues,
} from '@/app/lib/cars/forms';

const initialState: UpdateOwnerCarFormState = {};

export function EditCarForm({
	id,
	initial,
}: {
	id: string;
	initial: UpdateOwnerCarFormValues;
}) {
	const [state, action, pending] = useActionState(
		updateOwnerCarAction.bind(null, id),
		initialState,
	);
	const v: Partial<UpdateOwnerCarFormValues> = state?.values ?? initial;
	const err = state?.errors;

	return (
		<form action={action} className='flex flex-col gap-4'>
			<FormErrorBanner message={state?.message} />

			<Fieldset title='Car'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field
						label='Plate prefix'
						name='plate_prefix'
						defaultValue={v.plate_prefix ?? ''}
						error={err?.plate_prefix?.[0]}
						maxLength={8}
					/>
					<Field
						label='Car number'
						name='car_number'
						defaultValue={v.car_number ?? ''}
						error={err?.car_number?.[0]}
						maxLength={20}
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
				idleLabel='Save changes'
				pendingLabel='Saving…'
			/>
		</form>
	);
}
