'use client';

import { useMiniApp } from './miniapp-provider';
import { hapticImpact } from '@/app/lib/miniapp/telegram';

/**
 * Renders the Mini App only once a session exists, and owns every
 * pre-authenticated state.
 *
 * These screens are the first thing a user sees, so each one is a designed
 * state rather than a bare spinner or a raw error string.
 */
export function MiniAppGate({ children }: { children: React.ReactNode }) {
	const { status, retry } = useMiniApp();

	if (status === 'authenticated') return <>{children}</>;
	if (status === 'bootstrapping') return <BootSplash />;
	if (status === 'outside') return <OutsideTelegramNotice />;
	return <AuthFailedNotice onRetry={retry} />;
}

/** Brand mark — a parking pin that reads at any size. */
function ParkingMark({ className = '' }: { className?: string }) {
	return (
		<svg
			viewBox='0 0 48 48'
			fill='none'
			aria-hidden='true'
			className={className}
		>
			<path
				d='M24 3c8.284 0 15 6.716 15 15 0 10.5-15 27-15 27S9 28.5 9 18C9 9.716 15.716 3 24 3Z'
				fill='var(--sp-accent)'
			/>
			<path
				d='M19.5 26V11.5h6a5 5 0 0 1 0 10h-6'
				stroke='var(--sp-accent-text)'
				strokeWidth='3.2'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
}

/**
 * Boot state. The expanding rings give the wait a heartbeat, and the skeleton
 * rows below hint at the shape of the content that is about to land — the
 * screen never jumps from "nothing" to "everything".
 */
function BootSplash() {
	return (
		<div className='flex min-h-dvh flex-col items-center justify-center px-8'>
			<div className='relative flex size-24 items-center justify-center'>
				<span
					className='sp-pulse-ring absolute inset-0 rounded-full'
					style={{
						background: 'color-mix(in srgb, var(--sp-accent) 30%, transparent)',
					}}
				/>
				<span
					className='sp-pulse-ring absolute inset-0 rounded-full'
					style={{
						background: 'color-mix(in srgb, var(--sp-accent) 22%, transparent)',
						animationDelay: '600ms',
					}}
				/>
				<ParkingMark className='sp-animate-scale relative size-14' />
			</div>

			<p className='sp-animate-in mt-7 text-base font-semibold'>الموقف الذكي</p>
			<p
				className='sp-animate-in mt-1 text-sm'
				style={{ color: 'var(--sp-muted)', animationDelay: '80ms' }}
			>
				جارٍ تأمين جلستك…
			</p>

			<div className='sp-stagger mt-10 w-full max-w-xs space-y-3'>
				<div className='sp-skeleton h-14 rounded-2xl' />
				<div className='sp-skeleton h-14 rounded-2xl' />
				<div className='sp-skeleton h-14 rounded-2xl' />
			</div>
		</div>
	);
}

/** Shown when the page is opened in a normal browser instead of Telegram. */
function OutsideTelegramNotice() {
	return (
		<div className='flex min-h-dvh flex-col items-center justify-center px-8 text-center'>
			<ParkingMark className='sp-animate-scale size-16' />

			<h1 className='sp-animate-in mt-6 text-lg font-semibold'>
				افتح التطبيق داخل تيليغرام
			</h1>
			<p
				className='sp-animate-in mt-2 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)', animationDelay: '80ms' }}
			>
				يسجّلك التطبيق دخولاً تلقائياً عبر حسابك في تيليغرام، لذلك يجب فتحه من
				بوت الموقف الذكي.
			</p>

			<div
				className='sp-card sp-animate-in mt-7 w-full max-w-xs px-5 py-4 text-right'
				style={{ animationDelay: '150ms' }}
			>
				<p
					className='text-xs font-semibold'
					style={{ color: 'var(--sp-muted)' }}
				>
					طريقة الفتح
				</p>
				<ol className='mt-3 space-y-2 text-sm'>
					<li>١. افتح بوت الموقف الذكي في تيليغرام.</li>
					<li>
						٢. اضغط زر القائمة، أو أرسل{' '}
						<span className='font-semibold'>ابدأ</span>.
					</li>
					<li>٣. اختر «فتح التطبيق».</li>
				</ol>
			</div>
		</div>
	);
}

/** Signature rejected, backend unreachable, or the session could not resolve. */
function AuthFailedNotice({ onRetry }: { onRetry: () => void }) {
	return (
		<div className='flex min-h-dvh flex-col items-center justify-center px-8 text-center'>
			<div
				className='sp-animate-scale flex size-16 items-center justify-center rounded-full'
				style={{
					background: 'color-mix(in srgb, var(--sp-danger) 14%, transparent)',
				}}
			>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					className='size-8'
					aria-hidden='true'
				>
					<path
						d='M12 8v5m0 3.5h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'
						stroke='var(--sp-danger)'
						strokeWidth='1.8'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			</div>

			<h1 className='sp-animate-in mt-6 text-lg font-semibold'>
				تعذّر التحقق من جلستك
			</h1>
			<p
				className='sp-animate-in mt-2 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)', animationDelay: '80ms' }}
			>
				قد يحدث هذا إذا بقي التطبيق مفتوحاً مدة طويلة. إعادة فتحه من البوت تحلّ
				المشكلة عادةً.
			</p>

			<button
				type='button'
				onClick={() => {
					hapticImpact('medium');
					onRetry();
				}}
				className='sp-button sp-animate-in mt-7 w-full max-w-xs px-6 py-3.5 text-sm'
				style={{ animationDelay: '150ms' }}
			>
				إعادة المحاولة
			</button>
		</div>
	);
}
