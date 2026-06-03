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

			<div className='relative'>
				<div className='absolute inset-0 flex items-center'>
					<span className='w-full border-t border-zinc-200 dark:border-zinc-800' />
				</div>
				<div className='relative flex justify-center text-xs uppercase'>
					<span className='bg-background px-2 text-zinc-500'>or</span>
				</div>
			</div>

			<Link
				href='/auth/whatsapp'
				className='flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white text-sm font-medium shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
			>
				Sign in with WhatsApp
			</Link>

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
