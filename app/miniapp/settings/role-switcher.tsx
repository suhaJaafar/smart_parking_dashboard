'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { switchRoleAction } from '@/app/lib/miniapp/profile-actions';
import {
	confirmAction,
	hapticImpact,
	hapticNotification,
} from '@/app/lib/miniapp/telegram';

type Role = 'owner' | 'customer';

/**
 * Role chooser.
 *
 * Roles are mutually exclusive server-side, so this is a switch and not a
 * toggle-on: picking one detaches the other. The confirmation makes that
 * consequence explicit before anything changes.
 *
 * Becoming an owner requires a reachable phone number — the same gate the bot
 * applies before letting anyone register a garage. A WebView can't open
 * Telegram's share-contact keyboard, so we ask for it inline instead.
 */
export function RoleSwitcher({
	currentRole,
	hasPhone,
}: {
	currentRole: Role;
	hasPhone: boolean;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState<string | null>(null);
	const [askPhone, setAskPhone] = useState(false);
	const [phone, setPhone] = useState('');

	const submit = (role: Role, phoneNumber?: string) => {
		startTransition(async () => {
			const result = await switchRoleAction({
				role,
				...(phoneNumber ? { phone_number: phoneNumber } : {}),
			});

			if (!result.ok) {
				if (result.error === 'phone_required') {
					setAskPhone(true);
					setError('أدخل رقم هاتف صحيح (7 إلى 15 رقماً).');
					hapticNotification('warning');
					return;
				}
				setError('تعذّر تغيير الدور. حاول مرة أخرى.');
				hapticNotification('error');
				return;
			}

			hapticNotification('success');
			setAskPhone(false);
			setError(null);
			// The action already revalidated `/miniapp`; adding `router.refresh()`
			// here would only extend the pending transition.
			router.replace('/miniapp');
		});
	};

	const choose = (role: Role) => {
		if (role === currentRole) return;

		void (async () => {
			hapticImpact('medium');

			const confirmed = await confirmAction(
				role === 'owner'
					? 'سيتم تحويل حسابك إلى مالك موقف، وستفقد خيارات السائق. هل تريد المتابعة؟'
					: 'سيتم تحويل حسابك إلى سائق، وستفقد خيارات إدارة المواقف. هل تريد المتابعة؟',
			);
			if (!confirmed) return;

			// Ask for the phone up-front when we know the backend will demand it.
			if (role === 'owner' && !hasPhone) {
				setAskPhone(true);
				return;
			}

			submit(role);
		})();
	};

	return (
		<div className='px-5 pt-5'>
			<h2
				className='pb-2.5 text-xs font-semibold'
				style={{ color: 'var(--sp-muted)' }}
			>
				نوع الحساب
			</h2>

			<div className='sp-stagger space-y-3'>
				<RoleOption
					title='سائق'
					description='ابحث عن موقف، احجز مكانك، وادفع إلكترونياً'
					icon='car'
					selected={currentRole === 'customer'}
					disabled={isPending}
					onSelect={() => choose('customer')}
				/>
				<RoleOption
					title='مالك موقف'
					description='سجّل موقفك، أدخل السيارات، وتابع الإشغال والأرباح'
					icon='building'
					selected={currentRole === 'owner'}
					disabled={isPending}
					onSelect={() => choose('owner')}
				/>
			</div>

			{askPhone && (
				<div className='sp-card sp-animate-in mt-4 px-4 py-4'>
					<p className='text-sm font-semibold'>رقم الهاتف</p>
					<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
						يحتاج مالك الموقف إلى رقم يمكن للزبائن التواصل عبره.
					</p>

					<input
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						inputMode='tel'
						placeholder='07XXXXXXXXX'
						aria-label='رقم الهاتف'
						dir='ltr'
						className='mt-3 w-full rounded-xl px-3.5 py-3 text-base outline-none'
						style={{
							background: 'var(--sp-surface-alt)',
							border:
								'1px solid color-mix(in srgb, var(--sp-text) 12%, transparent)',
							color: 'var(--sp-text)',
						}}
					/>

					<button
						type='button'
						disabled={isPending || phone.trim().length < 7}
						onClick={() => submit('owner', phone.trim())}
						className='sp-button mt-3 w-full px-6 py-3 text-sm'
					>
						{isPending ? 'جارٍ الحفظ…' : 'تأكيد وتفعيل وضع المالك'}
					</button>
				</div>
			)}

			{error && (
				<p
					role='alert'
					className='sp-animate-in mt-3 rounded-xl px-4 py-3 text-sm'
					style={{
						background: 'color-mix(in srgb, var(--sp-danger) 12%, transparent)',
						color: 'var(--sp-danger)',
					}}
				>
					{error}
				</p>
			)}

			<p
				className='mt-5 text-xs leading-relaxed'
				style={{ color: 'var(--sp-muted)' }}
			>
				يمكنك تغيير نوع حسابك في أي وقت. لن يتم حذف حجوزاتك أو مواقفك السابقة.
			</p>
		</div>
	);
}

function RoleOption({
	title,
	description,
	icon,
	selected,
	disabled,
	onSelect,
}: {
	title: string;
	description: string;
	icon: 'car' | 'building';
	selected: boolean;
	disabled: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type='button'
			disabled={disabled}
			aria-pressed={selected}
			onClick={onSelect}
			className='sp-pressable flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-right disabled:opacity-60'
			style={{
				background: 'var(--sp-surface)',
				border: selected
					? '1.5px solid var(--sp-accent)'
					: '1px solid color-mix(in srgb, var(--sp-text) 8%, transparent)',
			}}
		>
			<span
				className='flex size-11 shrink-0 items-center justify-center rounded-xl'
				style={{
					background: 'color-mix(in srgb, var(--sp-accent) 16%, transparent)',
				}}
			>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					className='size-5'
					aria-hidden='true'
				>
					{icon === 'car' ? (
						<>
							<path
								d='M5 16.5h14M6.5 16.5v1.8a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1.8M20.5 16.5v1.8a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1.8'
								stroke='var(--sp-accent)'
								strokeWidth='1.7'
								strokeLinecap='round'
							/>
							<path
								d='M3.5 16.5v-3.2l1.7-4.4A2 2 0 0 1 7.07 7.6h9.86a2 2 0 0 1 1.87 1.3l1.7 4.4v3.2'
								stroke='var(--sp-accent)'
								strokeWidth='1.7'
								strokeLinejoin='round'
							/>
						</>
					) : (
						<>
							<path
								d='M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21'
								stroke='var(--sp-accent)'
								strokeWidth='1.7'
								strokeLinejoin='round'
							/>
							<path
								d='M14 10h4.5A1.5 1.5 0 0 1 20 11.5V21M3 21h18'
								stroke='var(--sp-accent)'
								strokeWidth='1.7'
								strokeLinecap='round'
							/>
						</>
					)}
				</svg>
			</span>

			<span className='min-w-0 flex-1'>
				<span className='block text-base font-semibold leading-tight'>
					{title}
				</span>
				<span
					className='mt-0.5 block text-sm leading-snug'
					style={{ color: 'var(--sp-muted)' }}
				>
					{description}
				</span>
			</span>

			{selected && (
				<span
					className='sp-animate-scale flex size-6 shrink-0 items-center justify-center rounded-full'
					style={{
						background: 'var(--sp-accent)',
						color: 'var(--sp-accent-text)',
					}}
					aria-hidden='true'
				>
					<svg viewBox='0 0 24 24' fill='none' className='size-4'>
						<path
							d='m5 13 4 4L19 7'
							stroke='currentColor'
							strokeWidth='2.6'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</span>
			)}
		</button>
	);
}
