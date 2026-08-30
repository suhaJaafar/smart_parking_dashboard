'use client';

import { useState } from 'react';

import { hapticImpact } from '@/app/lib/miniapp/telegram';

/**
 * Bottom sheet asking for a plate.
 *
 * Shown only when the arriving customer has no vehicle on record — the same
 * point at which the bot's car-entry flow falls back to its `plate` step.
 */
export function PlateSheet({
	customerName,
	onSubmit,
	onDismiss,
}: {
	customerName: string;
	onSubmit: (plate: { plate_prefix: string; car_number: string }) => void;
	onDismiss: () => void;
}) {
	const [prefix, setPrefix] = useState('');
	const [number, setNumber] = useState('');

	const trimmedPrefix = prefix.trim().toUpperCase();
	const trimmedNumber = number.trim();
	const valid = trimmedPrefix.length > 0 && trimmedNumber.length > 0;

	return (
		<div
			className='fixed inset-0 z-50 flex items-end'
			role='dialog'
			aria-modal='true'
			aria-label='Enter the car plate'
		>
			<button
				type='button'
				aria-label='إغلاق'
				onClick={onDismiss}
				className='sp-animate-in absolute inset-0 bg-black/45'
			/>

			<div
				className='sp-animate-in relative w-full rounded-t-3xl px-5 pb-8 pt-5'
				style={{
					background: 'var(--sp-bg)',
					paddingBottom: 'calc(2rem + var(--sp-safe-bottom))',
				}}
			>
				<div
					className='mx-auto mb-4 h-1 w-10 rounded-full'
					style={{
						background: 'color-mix(in srgb, var(--sp-text) 18%, transparent)',
					}}
				/>

				<h2 className='text-base font-semibold'>أدخِل رقم اللوحة</h2>
				<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
					لا توجد سيارة مسجلة لـ {customerName} بعد.
				</p>

				<div className='mt-4 flex gap-2.5'>
					<input
						value={prefix}
						onChange={(e) => setPrefix(e.target.value)}
						placeholder='BG'
						inputMode='text'
						autoCapitalize='characters'
						maxLength={8}
						aria-label='بادئة اللوحة'
						className='w-24 rounded-xl px-3.5 py-3 text-center font-mono text-base uppercase outline-none'
						style={{
							background: 'var(--sp-surface)',
							border:
								'1px solid color-mix(in srgb, var(--sp-text) 12%, transparent)',
							color: 'var(--sp-text)',
						}}
					/>
					<input
						value={number}
						onChange={(e) => setNumber(e.target.value)}
						placeholder='12345'
						inputMode='numeric'
						maxLength={20}
						aria-label='رقم اللوحة'
						className='flex-1 rounded-xl px-3.5 py-3 font-mono text-base outline-none'
						style={{
							background: 'var(--sp-surface)',
							border:
								'1px solid color-mix(in srgb, var(--sp-text) 12%, transparent)',
							color: 'var(--sp-text)',
						}}
					/>
				</div>

				<button
					type='button'
					disabled={!valid}
					onClick={() => {
						hapticImpact('medium');
						onSubmit({
							plate_prefix: trimmedPrefix,
							car_number: trimmedNumber,
						});
					}}
					className='sp-button mt-4 w-full px-6 py-3.5 text-sm'
				>
					إدخال السيارة
				</button>

				<button
					type='button'
					onClick={onDismiss}
					className='mt-2 w-full py-2.5 text-sm font-semibold'
					style={{ color: 'var(--sp-muted)' }}
				>
					تراجع
				</button>
			</div>
		</div>
	);
}
