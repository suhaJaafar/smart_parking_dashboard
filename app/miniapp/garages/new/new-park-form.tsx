'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createParkAction } from '@/app/lib/miniapp/park-actions';
import { resolvePosition } from '@/app/lib/miniapp/location';
import { STATE_OPTIONS_AR } from '@/app/lib/miniapp/states-ar';
import {
	hapticImpact,
	hapticNotification,
	hapticSelection,
} from '@/app/lib/miniapp/telegram';
import { State } from '@/app/types/state';
import type { Coordinates } from '@/app/types/miniapp';

/** Where the pin comes from — shown so the owner knows what they're saving. */
type PinState =
	| { kind: 'none' }
	| { kind: 'locating' }
	| { kind: 'set'; coords: Coordinates }
	| { kind: 'denied' };

export function NewParkForm() {
	const router = useRouter();
	const [isSaving, startSaving] = useTransition();

	const [name, setName] = useState('');
	const [capacity, setCapacity] = useState('');
	const [price, setPrice] = useState('');
	const [city, setCity] = useState('');
	const [state, setState] = useState<State>(State.BAGHDAD);
	const [pin, setPin] = useState<PinState>({ kind: 'none' });
	const [error, setError] = useState<string | null>(null);
	// Submitting ends the form rather than navigating: the outcome is "wait for
	// review", which needs explaining on its own screen instead of being
	// flashed as a toast on the way to a list the garage is not in yet.
	const [submitted, setSubmitted] = useState<string | null>(null);

	const capacityNum = Number(capacity);
	const priceNum = price.trim() === '' ? undefined : Number(price);

	const canSave =
		name.trim().length > 0 &&
		Number.isInteger(capacityNum) &&
		capacityNum >= 1 &&
		(priceNum === undefined || (Number.isFinite(priceNum) && priceNum >= 0)) &&
		pin.kind === 'set' &&
		!isSaving;

	/** Capture the garage's coordinates from the device. */
	const locate = useCallback(() => {
		hapticImpact('light');
		setError(null);
		setPin({ kind: 'locating' });

		// maxAgeMs 0: a cached fix from wherever the owner was earlier would pin
		// the garage to the wrong place. This is the one screen that must read
		// the device fresh every time.
		void resolvePosition({ maxAgeMs: 0 }).then((outcome) => {
			if (!outcome.ok) {
				hapticNotification('error');
				setPin({ kind: 'denied' });
				return;
			}

			hapticNotification('success');
			setPin({ kind: 'set', coords: outcome.coords });
		});
	}, []);

	const save = () => {
		if (pin.kind !== 'set') return;

		startSaving(async () => {
			const result = await createParkAction({
				name: name.trim(),
				capacity: capacityNum,
				...(priceNum !== undefined ? { price: priceNum } : {}),
				state,
				...(city.trim() ? { city: city.trim() } : {}),
				latitude: pin.coords.latitude,
				longitude: pin.coords.longitude,
			});

			if (!result.ok) {
				hapticNotification('error');
				setError(
					result.error === 'invalid_request'
						? 'تحقّق من البيانات المُدخلة ثم حاول مرة أخرى.'
						: 'تعذّر حفظ الموقف. حاول مرة أخرى.',
				);
				return;
			}

			hapticNotification('success');
			setSubmitted(name.trim());
		});
	};

	if (submitted !== null) {
		return (
			<SubmittedNotice
				name={submitted}
				onDone={() => router.replace('/miniapp/garages')}
			/>
		);
	}

	return (
		<div className='space-y-4 px-5 pt-5'>
			{error && (
				<p
					role='alert'
					className='sp-animate-in rounded-xl px-4 py-3 text-sm'
					style={{
						background: 'color-mix(in srgb, var(--sp-danger) 12%, transparent)',
						color: 'var(--sp-danger)',
					}}
				>
					{error}
				</p>
			)}

			<Field label='اسم الموقف' hint='مثال: كراج النور'>
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					maxLength={255}
					placeholder='اسم الموقف'
					className='sp-input'
				/>
			</Field>

			{/* items-end keeps both inputs on one baseline even if a label ever
			    wraps to two lines on a narrow phone. */}
			<div className='grid grid-cols-2 items-end gap-3'>
				<Field label='عدد الأماكن'>
					<input
						value={capacity}
						onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ''))}
						inputMode='numeric'
						placeholder='20'
						dir='ltr'
						className='sp-input text-center'
					/>
				</Field>

				<Field label='السعر (د.ع)' hint='اختياري'>
					<input
						value={price}
						onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
						inputMode='numeric'
						placeholder='3000'
						dir='ltr'
						className='sp-input text-center'
					/>
				</Field>
			</div>

			<p className='-mt-2 text-xs' style={{ color: 'var(--sp-muted)' }}>
				اترك السعر فارغاً لاستخدام السعر الافتراضي.
			</p>

			<Field label='المحافظة'>
				<select
					value={state}
					onChange={(e) => {
						hapticSelection();
						setState(Number(e.target.value) as State);
					}}
					className='sp-input'
				>
					{STATE_OPTIONS_AR.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</Field>

			<Field label='المدينة / المنطقة' hint='اختياري'>
				<input
					value={city}
					onChange={(e) => setCity(e.target.value)}
					maxLength={255}
					placeholder='الكرادة'
					className='sp-input'
				/>
			</Field>

			<LocationPicker pin={pin} onLocate={locate} />

			<button
				type='button'
				disabled={!canSave}
				onClick={save}
				className='sp-button w-full px-6 py-3.5 text-sm disabled:opacity-50'
			>
				{isSaving ? 'جارٍ الحفظ…' : 'حفظ الموقف'}
			</button>
		</div>
	);
}

function Field({
	label,
	hint,
	children,
}: {
	label: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<label className='sp-animate-in block'>
			{/* nowrap: a wrapping label would desync the inputs in the 2-up grid,
			    so long guidance belongs under the field, not beside the label. */}
			<span className='mb-1.5 flex items-baseline gap-2 whitespace-nowrap'>
				<span className='truncate text-sm font-semibold'>{label}</span>
				{hint && (
					<span
						className='shrink-0 text-xs'
						style={{ color: 'var(--sp-muted)' }}
					>
						{hint}
					</span>
				)}
			</span>
			{children}
		</label>
	);
}

/** Pin capture with a state-specific affordance rather than a bare button. */
function LocationPicker({
	pin,
	onLocate,
}: {
	pin: PinState;
	onLocate: () => void;
}) {
	const isSet = pin.kind === 'set';

	return (
		<div
			className='sp-card sp-animate-in px-4 py-4'
			style={
				isSet
					? { borderColor: 'color-mix(in srgb, #22c55e 45%, transparent)' }
					: undefined
			}
		>
			<div className='flex items-center gap-3'>
				<span
					className='flex size-10 shrink-0 items-center justify-center rounded-xl'
					style={{
						background: isSet
							? 'color-mix(in srgb, #22c55e 16%, transparent)'
							: 'color-mix(in srgb, var(--sp-accent) 16%, transparent)',
					}}
				>
					<svg
						viewBox='0 0 24 24'
						fill='none'
						className='size-5'
						aria-hidden='true'
					>
						<path
							d='M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z'
							stroke={isSet ? '#22c55e' : 'var(--sp-accent)'}
							strokeWidth='1.8'
							strokeLinejoin='round'
						/>
						<circle
							cx='12'
							cy='10'
							r='2.5'
							stroke={isSet ? '#22c55e' : 'var(--sp-accent)'}
							strokeWidth='1.8'
						/>
					</svg>
				</span>

				<div className='min-w-0 flex-1'>
					<p className='text-sm font-semibold'>موقع الكراج</p>
					<p className='mt-0.5 text-sm' style={{ color: 'var(--sp-muted)' }}>
						{pin.kind === 'set' && (
							<span dir='ltr' className='tabular-nums'>
								{pin.coords.latitude.toFixed(5)},{' '}
								{pin.coords.longitude.toFixed(5)}
							</span>
						)}
						{pin.kind === 'none' && 'قف داخل الكراج ثم حدّد الموقع'}
						{pin.kind === 'locating' && 'جارٍ تحديد الموقع…'}
						{pin.kind === 'denied' && 'تعذّر تحديد الموقع. فعّل صلاحية الموقع.'}
					</p>
				</div>
			</div>

			<button
				type='button'
				disabled={pin.kind === 'locating'}
				onClick={onLocate}
				className='sp-button-ghost mt-3 w-full px-4 py-2.5 text-sm disabled:opacity-60'
			>
				{pin.kind === 'set' ? 'تحديث الموقع' : 'تحديد موقعي الآن'}
			</button>
		</div>
	);
}

/**
 * Post-submission state.
 *
 * Registering a garage is the one flow that ends in a wait rather than a
 * result, so the screen names the wait explicitly — what was received, who is
 * reviewing it, and by when — instead of leaving the owner to wonder whether
 * the save worked.
 */
function SubmittedNotice({
	name,
	onDone,
}: {
	name: string;
	onDone: () => void;
}) {
	return (
		<div className='flex flex-col items-center px-8 pt-14 text-center'>
			<div
				className='sp-animate-scale relative flex size-20 items-center justify-center rounded-full'
				style={{ background: 'var(--sp-accent-soft)' }}
			>
				<span
					className='sp-pulse-ring absolute inset-0 rounded-full'
					style={{
						background: 'color-mix(in srgb, var(--sp-accent) 26%, transparent)',
					}}
				/>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					className='relative size-9'
					aria-hidden='true'
				>
					<path
						d='M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
						stroke='var(--sp-accent-strong)'
						strokeWidth='1.8'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			</div>

			<h2 className='sp-animate-in mt-6 text-lg font-bold'>تم استلام طلبك</h2>

			<p
				className='sp-animate-in mt-2 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)', animationDelay: '80ms' }}
			>
				طلب تسجيل <span className='font-semibold'>{name}</span> قيد المراجعة من
				قبل الإدارة، وسيتم الرد خلال{' '}
				<span className='font-semibold'>24 ساعة</span>.
			</p>

			<div
				className='sp-card sp-animate-in mt-7 w-full max-w-xs px-5 py-4 text-right'
				style={{ animationDelay: '150ms' }}
			>
				<p
					className='text-xs font-semibold'
					style={{ color: 'var(--sp-muted)' }}
				>
					ما الذي يحدث الآن؟
				</p>
				<ol className='mt-3 space-y-2 text-sm leading-relaxed'>
					<li>١. تراجع الإدارة بيانات موقفك وموقعه.</li>
					<li>٢. يصلك إشعار في تيليغرام فور الموافقة.</li>
					<li>٣. عندها يظهر موقفك للسائقين ويمكنك إدارة حجوزاته.</li>
				</ol>
			</div>

			<button
				type='button'
				onClick={onDone}
				className='sp-button sp-animate-in mt-6 w-full max-w-xs px-6 py-3 text-sm'
				style={{ animationDelay: '220ms' }}
			>
				عرض مواقفي
			</button>
		</div>
	);
}
