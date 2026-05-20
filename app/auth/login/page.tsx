'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Field, FormErrorBanner, SubmitButton } from '@/app/components/form';
import { loginAction } from '@/app/lib/auth/actions';
import type { LoginFormState } from '@/app/lib/auth/forms';

const initialState: LoginFormState = {};

export default function LoginPage() {
	const [state, action, pending] = useActionState(loginAction, initialState);
	const v = state?.values ?? {};
	const err = state?.errors;

	return (
		<div className='flex flex-col gap-6'>
			<header className='space-y-1'>
				<h1 className='text-2xl font-semibold tracking-tight'>Sign in</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Welcome back. Enter your credentials to access the dashboard.
				</p>
			</header>

			<FormErrorBanner message={state?.message} />

			<form action={action} className='flex flex-col gap-4'>
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
					label='Password'
					name='password'
					type='password'
					autoComplete='current-password'
					error={err?.password?.[0]}
					required
				/>

				<SubmitButton
					pending={pending}
					idleLabel='Sign in'
					pendingLabel='Signing in…'
				/>
			</form>

			<p className='text-center text-sm text-zinc-600 dark:text-zinc-400'>
				Don&apos;t have an account?{' '}
				<Link
					href='/auth/register'
					className='font-medium text-foreground underline-offset-4 hover:underline'
				>
					Create one
				</Link>
			</p>
		</div>
	);
}
