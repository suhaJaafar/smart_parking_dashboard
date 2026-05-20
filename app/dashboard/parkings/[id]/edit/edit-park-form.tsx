'use client';

import { useActionState, useEffect, useState } from 'react';

import { Field, FormErrorBanner, SubmitButton } from '@/app/components/form';
import { updateParkAction } from '@/app/lib/parks/actions';
import type {
	UpdateParkFormState,
	UpdateParkFormValues,
} from '@/app/lib/parks/forms';

const initialState: UpdateParkFormState = {};

export function EditParkForm({
	id,
	initial,
}: {
	id: string;
	initial: UpdateParkFormValues;
}) {
	const [state, action, pending] = useActionState(
		updateParkAction.bind(null, id),
		initialState,
	);
	const v: Partial<UpdateParkFormValues> = state?.values ?? initial;
	const err = state?.errors;

	/* Capacity → Free spaces mirror — see new-park-form for rationale. */
	const [capacity, setCapacity] = useState(v.capacity ?? '');
	const [freeSpaces, setFreeSpaces] = useState(v.free_spaces ?? '');
	const [freeSpacesTouched, setFreeSpacesTouched] = useState(true);
	useEffect(() => {
		if (!freeSpacesTouched) setFreeSpaces(capacity);
	}, [capacity, freeSpacesTouched]);

	return (
		<form action={action} className='flex flex-col gap-4'>
			<FormErrorBanner message={state?.message} />

			<Field
				label='Name'
				name='name'
				defaultValue={v.name ?? ''}
				error={err?.name?.[0]}
			/>
			<div className='grid gap-4 sm:grid-cols-2'>
				<Field
					label='Capacity'
					name='capacity'
					type='number'
					min={1}
					value={capacity}
					onChange={(e) => {
						setCapacity(e.currentTarget.value);
						// If capacity is raised past the user's previous free_spaces
						// default, fall back into mirror mode so the value stays sane.
						if (!freeSpacesTouched) setFreeSpaces(e.currentTarget.value);
					}}
					error={err?.capacity?.[0]}
				/>
				<Field
					label='Free spaces'
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

			<SubmitButton
				pending={pending}
				idleLabel='Save changes'
				pendingLabel='Saving…'
			/>
		</form>
	);
}
