'use client';

import { useActionState } from 'react';

import {
	Field,
	Fieldset,
	FormErrorBanner,
	SubmitButton,
} from '@/app/components/form';
import { RolesField } from '@/app/dashboard/users/roles-field';
import { createUserAction } from '@/app/lib/users/actions';
import type {
	CreateUserFormState,
	CreateUserFormValues,
} from '@/app/lib/users/forms';

const initialState: CreateUserFormState = {};

export function NewUserForm() {
	const [state, action, pending] = useActionState(
		createUserAction,
		initialState,
	);
	const v: Partial<CreateUserFormValues> = state?.values ?? {};
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
						required
					/>
					<Field
						label='Email'
						name='email'
						type='email'
						autoComplete='email'
						defaultValue={v.email ?? ''}
						error={err?.email?.[0]}
						required
					/>
				</div>

				<div className='grid gap-4 sm:grid-cols-2'>
					<Field
						label='Password'
						name='password'
						type='password'
						autoComplete='new-password'
						hint='At least 8 characters.'
						defaultValue={v.password ?? ''}
						error={err?.password?.[0]}
						required
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
				description='Select which roles this user holds. Leave empty to default to a basic user.'
			>
				<RolesField defaultValue={v.roles ?? ''} error={err?.roles?.[0]} />
			</Fieldset>

			<SubmitButton
				pending={pending}
				idleLabel='Create user'
				pendingLabel='Creating…'
			/>
		</form>
	);
}
