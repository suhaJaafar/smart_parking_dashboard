'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Field, FormErrorBanner, SubmitButton } from '@/app/components/form';
import { registerAction } from '@/app/lib/auth/actions';
import type { RegisterFormState } from '@/app/lib/auth/forms';

const initialState: RegisterFormState = {};

export default function RegisterPage() {
	const [state, action, pending] = useActionState(registerAction, initialState);
	const v = state?.values ?? {};
	const err = state?.errors;

	return (
		<div className='flex flex-col gap-6'>
			<header className='space-y-1'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Create an account
				</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Sign up to start managing your parkings.
				</p>
			</header>

			<FormErrorBanner message={state?.message} />

			<form action={action} className='flex flex-col gap-4'>
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
				<Field
					label='Phone number'
					name='phone_number'
					autoComplete='tel'
					defaultValue={v.phone_number ?? ''}
					error={err?.phone_number?.[0]}
					required
				/>
				<Field
					label='Password'
					name='password'
					type='password'
					autoComplete='new-password'
					error={err?.password?.[0]}
					required
				/>

				<SubmitButton
					pending={pending}
					idleLabel='Create account'
					pendingLabel='Creating account…'
				/>
			</form>

			<p className='text-center text-sm text-zinc-600 dark:text-zinc-400'>
				Already have an account?{' '}
				<Link
					href='/auth/login'
					className='font-medium text-foreground underline-offset-4 hover:underline'
				>
					Sign in
				</Link>
			</p>
		</div>
	);
}
