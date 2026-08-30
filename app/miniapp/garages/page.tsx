import Link from 'next/link';

import { listMyParks } from '@/app/lib/parks/api';
import { formatPrice } from '@/app/lib/miniapp/format';
import type { Park } from '@/app/types/park';

import { TelegramBackButton } from '../components/telegram-back-button';
import { OccupancyRing } from '../components/occupancy-ring';

/**
 * مواقفي — the owner's garages.
 *
 * Mirrors the bot's "مواقفي" command: one card per garage showing live
 * availability, capacity and price. Server-rendered because it is pure
 * read-only data with no interaction beyond navigation.
 */
export default async function GaragesPage() {
	const res = await listMyParks(1);
	const parks: Park[] = res.ok ? (res.data.data ?? []) : [];
	const pendingCount = parks.filter(
		(park) => park.approval_status === 'pending',
	).length;

	return (
		<main className='pb-10'>
			<TelegramBackButton href='/miniapp' />

			<header className='sp-animate-in flex items-start gap-3 px-5 pb-1 pt-6'>
				<div className='min-w-0 flex-1'>
					<h1 className='text-2xl font-bold leading-tight'>مواقفي</h1>
					<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
						{parks.length === 0
							? 'لم تسجّل أي موقف بعد'
							: pendingCount > 0
								? `لديك ${parks.length} موقف — ${pendingCount} قيد المراجعة`
								: `لديك ${parks.length} موقف مسجّل`}
					</p>
				</div>

				{parks.length > 0 && (
					<Link
						href='/miniapp/garages/new'
						aria-label='إضافة موقف'
						className='sp-pressable flex size-10 shrink-0 items-center justify-center rounded-full text-xl font-bold'
						style={{
							background: 'var(--sp-accent)',
							color: 'var(--sp-accent-text)',
						}}
					>
						+
					</Link>
				)}
			</header>

			{parks.length === 0 ? (
				<EmptyGarages />
			) : (
				<div className='sp-stagger mt-4 space-y-3 px-5'>
					{parks.map((park) => (
						<GarageCard key={park.id} park={park} />
					))}
				</div>
			)}
		</main>
	);
}

function GarageCard({ park }: { park: Park }) {
	const capacity = park.capacity ?? 0;
	const free = park.free_spaces ?? 0;
	const occupied = Math.max(0, capacity - free);
	const pct = capacity > 0 ? (occupied / capacity) * 100 : 0;
	const pending = park.approval_status === 'pending';
	const rejected = park.approval_status === 'rejected';

	return (
		<article className='sp-card px-4 py-4'>
			<div className='flex items-center gap-4'>
				{/* A garage under review has no occupancy to speak of, so the ring
				    is replaced by the thing that actually matters: its status. */}
				<OccupancyRing
					value={pending || rejected ? 0 : pct}
					size={64}
					stroke={7}
				/>

				<div className='min-w-0 flex-1'>
					<h2 className='truncate text-base font-semibold leading-tight'>
						{park.name}
					</h2>
					<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
						{formatPrice(park.price ?? null)}
					</p>

					<div className='mt-2.5 flex items-center gap-4 text-sm'>
						{park.is_approved ? (
							<>
								<span className='inline-flex items-center gap-1.5'>
									<span
										className='size-2 rounded-full'
										style={{
											background: free > 0 ? '#22c55e' : 'var(--sp-danger)',
										}}
									/>
									<span
										style={{ color: free > 0 ? '#22c55e' : 'var(--sp-danger)' }}
									>
										{free > 0 ? `${free} متاح` : 'ممتلئ'}
									</span>
								</span>
								<span style={{ color: 'var(--sp-muted)' }}>
									السعة {capacity}
								</span>
							</>
						) : (
							<span style={{ color: 'var(--sp-muted)' }}>السعة {capacity}</span>
						)}
					</div>
				</div>
			</div>

			{park.is_approved ? (
				<Link
					href={`/miniapp/reservations?park_id=${park.id}`}
					className='sp-button-ghost sp-divider mt-3.5 block border-t px-4 py-2.5 text-center text-sm'
				>
					عرض حجوزات هذا الموقف
				</Link>
			) : (
				<ReviewState pending={pending} reason={park.rejection_reason ?? null} />
			)}
		</article>
	);
}

/**
 * Stands in for the reservations link while a garage is not live.
 *
 * Deliberately not a button: there is nothing to tap yet, and offering a
 * dead control would read as a bug rather than as "we are still reviewing".
 */
function ReviewState({
	pending,
	reason,
}: {
	pending: boolean;
	reason: string | null;
}) {
	const color = pending ? 'var(--sp-accent-strong)' : 'var(--sp-danger)';

	return (
		<div className='sp-divider mt-3.5 border-t pt-2.5'>
			<p
				className='flex items-center justify-center gap-2 py-1 text-sm font-semibold'
				style={{ color }}
			>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					className='size-4'
					aria-hidden='true'
				>
					{pending ? (
						<path
							d='M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
							stroke={color}
							strokeWidth='1.9'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					) : (
						<path
							d='M12 8v5m0 3.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
							stroke={color}
							strokeWidth='1.9'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					)}
				</svg>
				{pending ? 'قيد المراجعة' : 'لم تتم الموافقة'}
			</p>

			<p
				className='mt-0.5 text-center text-xs leading-relaxed'
				style={{ color: 'var(--sp-muted)' }}
			>
				{pending
					? 'سيتم الرد خلال 24 ساعة، وسيصلك إشعار فور الموافقة.'
					: (reason ?? 'يمكنك التواصل مع الإدارة لمعرفة التفاصيل.')}
			</p>
		</div>
	);
}

function EmptyGarages() {
	return (
		<div className='flex flex-col items-center px-8 pt-12 text-center'>
			<div
				className='sp-animate-scale flex size-14 items-center justify-center rounded-full'
				style={{
					background: 'color-mix(in srgb, var(--sp-accent) 14%, transparent)',
				}}
			>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					className='size-7'
					aria-hidden='true'
				>
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
				</svg>
			</div>

			<p
				className='sp-animate-in mt-5 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)' }}
			>
				سجّل موقفك الأول لتبدأ باستقبال الحجوزات.
			</p>

			<Link
				href='/miniapp/garages/new'
				className='sp-button sp-animate-in mt-6 px-6 py-3 text-sm'
				style={{ animationDelay: '120ms' }}
			>
				إضافة موقف جديد
			</Link>
		</div>
	);
}
