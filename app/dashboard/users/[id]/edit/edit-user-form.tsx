'use client';

import { useActionState } from 'react';

import {
	Field,
	Fieldset,
	FormErrorBanner,
	SubmitButton,
} from '@/app/components/form';
import { RolesField } from '@/app/dashboard/users/roles-field';
import { updateUserAction } from '@/app/lib/users/actions';
import type {
	UpdateUserFormState,
	UpdateUserFormValues,
} from '@/app/lib/users/forms';

interface EditUserFormProps {
	id: string;
	initial: Pick<
		UpdateUserFormValues,
		'name' | 'email' | 'phone_number' | 'roles'
	>;
}

const initialState: UpdateUserFormState = {};

export function EditUserForm({ id, initial }: EditUserFormProps) {
	const boundAction = updateUserAction.bind(null, id);
	const [state, action, pending] = useActionState(boundAction, initialState);

	// Sticky values fall back to the record's initial values for first render.
	const v: Partial<UpdateUserFormValues> = state?.values ?? initial;
	const err = state?.errors;

	return (
		<form action={action} className='flex flex-col gap-4'>
			<FormErrorBanner message={state?.message} />

			<Fieldset title='Account'>
				<div className='grid gap-4 sm:grid-cols-2'>
					<Field
						label='Name'
						name='name'
						autoComplete='name'
						defaultValue={v.name ?? ''}
						error={err?.name?.[0]}
					/>
					<Field
						label='Email'
						name='email'
						type='email'
						autoComplete='email'
						defaultValue={v.email ?? ''}
						error={err?.email?.[0]}
					/>
				</div>

				<div className='grid gap-4 sm:grid-cols-2'>
					<Field
						label='New password'
						name='password'
						type='password'
						autoComplete='new-password'
						hint='Leave blank to keep the current password.'
						defaultValue={v.password ?? ''}
						error={err?.password?.[0]}
					/>
					<Field
						label='Phone'
						name='phone_number'
						type='tel'
						autoComplete='tel'
						defaultValue={v.phone_number ?? ''}
						error={err?.phone_number?.[0]}
					/>
				</div>
			</Fieldset>

			<Fieldset
				title='Access'
				description='Roles fully replace the user’s current assignments when saved.'
			>
				<RolesField defaultValue={v.roles ?? ''} error={err?.roles?.[0]} />
			</Fieldset>

			<SubmitButton
				pending={pending}
				idleLabel='Save changes'
				pendingLabel='Saving…'
			/>
		</form>
	);
}
