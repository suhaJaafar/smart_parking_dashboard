'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';

import { Field, FormErrorBanner, SubmitButton } from '@/app/components/form';
import {
	whatsappRequestCodeAction,
	whatsappVerifyCodeAction,
	type WhatsappRequestCodeFormState,
	type WhatsappVerifyCodeFormState,
} from '@/app/lib/auth/actions';

const requestInitial: WhatsappRequestCodeFormState = {};
const verifyInitial: WhatsappVerifyCodeFormState = {};

export default function WhatsappLoginPage() {
	const [requestState, requestAction, requestPending] = useActionState(
		whatsappRequestCodeAction,
		requestInitial,
	);
	const [verifyState, verifyAction, verifyPending] = useActionState(
		whatsappVerifyCodeAction,
		verifyInitial,
	);

	// Step advances once the backend confirms it dispatched (or pretended to
	// dispatch) the code. We also keep a local copy of the phone so step 2
	// can submit it transparently as a hidden field.
	const [step, setStep] = useState<'request' | 'verify'>('request');
	const [phone, setPhone] = useState('');

	useEffect(() => {
		if (requestState?.codeSent && requestState.values?.phone_number) {
			setPhone(requestState.values.phone_number);
			setStep('verify');
		}
	}, [requestState]);

	if (step === 'request') {
		const v = requestState?.values ?? {};
		const err = requestState?.errors;

		return (
			<div className='flex flex-col gap-6'>
				<header className='space-y-1'>
					<h1 className='text-2xl font-semibold tracking-tight'>
						Sign in with WhatsApp
					</h1>
					<p className='text-sm text-zinc-600 dark:text-zinc-400'>
						We&apos;ll send a 6-digit code to the WhatsApp number you used to
						register your parks.
					</p>
				</header>

				<FormErrorBanner message={requestState?.message} />

				<form action={requestAction} className='flex flex-col gap-4'>
					<Field
						label='WhatsApp number'
						name='phone_number'
						type='tel'
						inputMode='tel'
						autoComplete='tel'
						placeholder='+9647775270135'
						defaultValue={v.phone_number ?? ''}
						error={err?.phone_number?.[0]}
						hint='Include the country code (e.g. +964…).'
						required
					/>

					<SubmitButton
						pending={requestPending}
						idleLabel='Send code'
						pendingLabel='Sending…'
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

	const err = verifyState?.errors;

	return (
		<div className='flex flex-col gap-6'>
			<header className='space-y-1'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Enter the code
				</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					We sent a 6-digit code on WhatsApp to{' '}
					<span className='font-medium'>{phone}</span>. It expires in 5 minutes.
				</p>
			</header>

			<FormErrorBanner message={verifyState?.message} />

			<form action={verifyAction} className='flex flex-col gap-4'>
				<input type='hidden' name='phone_number' value={phone} />

				<Field
					label='Verification code'
					name='code'
					type='text'
					inputMode='numeric'
					autoComplete='one-time-code'
					maxLength={6}
					pattern='[0-9]{6}'
					placeholder='123456'
					error={err?.code?.[0]}
					required
				/>

				<SubmitButton
					pending={verifyPending}
					idleLabel='Verify & sign in'
					pendingLabel='Verifying…'
				/>
			</form>

			<button
				type='button'
				onClick={() => setStep('request')}
				className='text-center text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400'
			>
				Use a different number
			</button>
		</div>
	);
}
