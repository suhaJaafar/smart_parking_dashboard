'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Field, FormErrorBanner, SubmitButton } from '@/app/components/form';
import {
	telegramVerifyCodeAction,
	type TelegramVerifyCodeFormState,
} from '@/app/lib/auth/actions';

const initialState: TelegramVerifyCodeFormState = {};

export default function TelegramLoginPage() {
	const [state, action, pending] = useActionState(
		telegramVerifyCodeAction,
		initialState,
	);
	const err = state?.errors;

	return (
		<div className='flex flex-col gap-6'>
			<header className='space-y-1'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Sign in with Telegram
				</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					Open the ParkIQ Telegram bot and send{' '}
					<span className='font-medium'>تسجيل الدخول</span> (or{' '}
					<span className='font-medium'>login</span>). The bot replies with a
					6-digit code — enter it below. It expires in 5 minutes.
				</p>
			</header>

			<FormErrorBanner message={state?.message} />

			<form action={action} className='flex flex-col gap-4'>
				<Field
					label='Verification code'
					name='code'
					type='text'
					inputMode='numeric'
					autoComplete='one-time-code'
					maxLength={6}
					pattern='[0-9]{6}'
					placeholder='123456'
					defaultValue={state?.values?.code ?? ''}
					error={err?.code?.[0]}
					hint='The 6-digit code the Telegram bot sent you.'
					required
				/>

				<SubmitButton
					pending={pending}
					idleLabel='Verify & sign in'
					pendingLabel='Verifying…'
				/>
			</form>

			<p className='text-center text-sm text-zinc-600 dark:text-zinc-400'>
				Prefer email and password?{' '}
				<Link
					href='/auth/login'
					className='font-medium text-foreground underline-offset-4 hover:underline'
				>
					Sign in classically
				</Link>
			</p>
		</div>
	);
}
