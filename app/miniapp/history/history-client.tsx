'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';

import { loadHistoryAction } from '@/app/lib/miniapp/actions';
import {
	formatDateTime,
	formatMonthLabel,
	formatPrice,
	messageForError,
	monthKey,
} from '@/app/lib/miniapp/format';
import {
	hapticImpact,
	hapticSelection,
	openExternalLink,
} from '@/app/lib/miniapp/telegram';
import type {
	CustomerReservation,
	CustomerReservationStatus,
	HistoryFilter,
	ReservationHistoryPage,
} from '@/app/types/miniapp';

import { StatTile } from '../components/stat-tile';

const FILTERS: { value: HistoryFilter; label: string }[] = [
	{ value: 'all', label: 'الكل' },
	{ value: 'completed', label: 'مكتملة' },
	{ value: 'unpaid', label: 'غير مدفوعة' },
	{ value: 'cancelled', label: 'ملغاة' },
];

/** Backend slugs are authoritative; this is only their Arabic surface. */
const STATUS_LABEL: Record<CustomerReservationStatus, string> = {
	waiting: 'بانتظار الوصول',
	lapsed: 'انتهت المهلة',
	active: 'داخل الموقف',
	completed: 'مكتمل',
	expired: 'منتهٍ',
	cancelled: 'ملغى',
	unknown: '—',
};

const SUCCESS = '#22c55e';

/**
 * The customer's log.
 *
 * Entries are grouped by month rather than listed flat: a log is scanned
 * ("what did I spend in تموز?"), not read top to bottom, and the headings give
 * that scan something to land on.
 */
export function HistoryClient({
	initial,
}: {
	initial: ReservationHistoryPage;
}) {
	const [entries, setEntries] = useState(initial.data);
	const [meta, setMeta] = useState(initial.meta);
	const [summary, setSummary] = useState(initial.summary);
	const [filter, setFilter] = useState<HistoryFilter>('all');
	const [error, setError] = useState<string | null>(null);
	const [isPending, startLoading] = useTransition();

	const load = useCallback((next: HistoryFilter, page: number) => {
		startLoading(async () => {
			const res = await loadHistoryAction({ filter: next, page });

			if (!res.ok) {
				setError(res.error);
				return;
			}

			setError(null);
			setMeta(res.data.meta);
			setSummary(res.data.summary);
			// Page 1 replaces (filter changed); later pages append.
			setEntries((prev) =>
				page === 1 ? res.data.data : [...prev, ...res.data.data],
			);
		});
	}, []);

	function changeFilter(next: HistoryFilter) {
		if (next === filter || isPending) return;
		hapticSelection();
		setFilter(next);
		load(next, 1);
	}

	// Entries arrive newest-first, so insertion order already sorts the groups.
	const groups = useMemo(() => {
		const map = new Map<
			string,
			{ label: string; items: CustomerReservation[] }
		>();

		for (const entry of entries) {
			const key = monthKey(entry.created_at);
			const group = map.get(key);

			if (group) group.items.push(entry);
			else
				map.set(key, {
					label: formatMonthLabel(entry.created_at),
					items: [entry],
				});
		}

		return [...map].map(([key, group]) => ({ key, ...group }));
	}, [entries]);

	const hasMore = meta.current_page < meta.last_page;
	const owes = Number(summary.due_total) > 0;

	return (
		<div className='pb-4'>
			<Summary summary={summary} owes={owes} />

			<div className='mt-5 flex gap-2 overflow-x-auto px-5 pb-1'>
				{FILTERS.map((option) => {
					const selected = option.value === filter;

					return (
						<button
							key={option.value}
							type='button'
							onClick={() => changeFilter(option.value)}
							aria-pressed={selected}
							className='sp-pressable shrink-0 rounded-full px-4 py-2 text-sm font-semibold'
							style={
								selected
									? {
											background: 'var(--sp-accent)',
											color: 'var(--sp-accent-text)',
										}
									: {
											background: 'var(--sp-surface-alt)',
											color: 'var(--sp-text)',
										}
							}
						>
							{option.label}
						</button>
					);
				})}
			</div>

			{error && (
				<div className='px-5 pt-4'>
					<div
						role='alert'
						className='sp-animate-in rounded-2xl px-4 py-3 text-sm font-medium'
						style={{
							background:
								'color-mix(in srgb, var(--sp-danger) 12%, transparent)',
							color: 'var(--sp-danger)',
						}}
					>
						{messageForError(error)}
					</div>
				</div>
			)}

			{entries.length === 0 && !isPending ? (
				<Empty filter={filter} />
			) : (
				<div className='mt-4 space-y-6'>
					{groups.map((group) => (
						<section key={group.key}>
							<h2
								className='px-5 pb-2 text-xs font-semibold'
								style={{ color: 'var(--sp-muted)' }}
							>
								{group.label}
							</h2>

							<div className='space-y-2.5 px-5'>
								{group.items.map((entry) => (
									<Entry key={entry.id} entry={entry} />
								))}
							</div>
						</section>
					))}
				</div>
			)}

			{hasMore && (
				<div className='px-5 pt-5'>
					<button
						type='button'
						disabled={isPending}
						onClick={() => {
							hapticImpact('light');
							load(filter, meta.current_page + 1);
						}}
						className='sp-button-ghost w-full px-6 py-3 text-sm'
					>
						{isPending ? 'جارٍ التحميل…' : 'عرض المزيد'}
					</button>
				</div>
			)}
		</div>
	);
}

function Summary({
	summary,
	owes,
}: {
	summary: ReservationHistoryPage['summary'];
	owes: boolean;
}) {
	return (
		<div className='sp-stagger grid grid-cols-2 gap-3 px-5 pt-5'>
			<StatTile label='حجوزات مكتملة' value={String(summary.stays)} />
			<StatTile
				label='إجمالي المدفوع'
				value={formatPrice(summary.paid_total, summary.currency)}
				tone='positive'
			/>

			{/* Only surfaced when there is something to act on — a permanent
			    "0 مستحق" tile would be noise on every other visit. */}
			{owes && (
				<div className='col-span-2'>
					<StatTile
						label='مبالغ مستحقة عليك'
						value={formatPrice(summary.due_total, summary.currency)}
						tone='danger'
					/>
				</div>
			)}
		</div>
	);
}

function Entry({ entry }: { entry: CustomerReservation }) {
	const payment = entry.payment;
	const unpaid = payment !== null && !payment.is_paid;

	return (
		<article className='sp-card px-4 py-3.5'>
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0'>
					<p className='truncate text-sm font-semibold'>
						{entry.park?.name ?? 'موقف محذوف'}
					</p>
					<p className='mt-1 text-xs' style={{ color: 'var(--sp-muted)' }}>
						{formatDateTime(entry.created_at)}
					</p>
				</div>

				<StatusPill status={entry.status_label} />
			</div>

			{payment && (
				<div className='sp-divider mt-3 flex items-center justify-between gap-3 border-t pt-3'>
					<span className='text-sm font-semibold tabular-nums'>
						{formatPrice(payment.amount, payment.currency)}
					</span>
					<PaymentBadge paid={payment.is_paid} cash={payment.is_cash} />
				</div>
			)}

			{unpaid && payment && (
				<button
					type='button'
					onClick={() => {
						hapticImpact('medium');
						// Through Telegram, so the gateway opens in the in-app browser
						// and the Mini App session survives the round trip.
						openExternalLink(payment.pay_url);
					}}
					className='sp-button mt-3 w-full px-5 py-2.5 text-sm'
				>
					ادفع الآن
				</button>
			)}

			{entry.booking_code && (
				<p className='mt-2.5 text-xs' style={{ color: 'var(--sp-muted)' }}>
					رمز الحجز: <span className='tabular-nums'>{entry.booking_code}</span>
				</p>
			)}
		</article>
	);
}

function StatusPill({ status }: { status: CustomerReservationStatus }) {
	const color = status === 'completed' ? SUCCESS : 'var(--sp-muted)';

	return (
		<span
			className='shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold'
			style={{
				background: `color-mix(in srgb, ${color} 14%, transparent)`,
				color,
			}}
		>
			{STATUS_LABEL[status]}
		</span>
	);
}

function PaymentBadge({ paid, cash }: { paid: boolean; cash: boolean }) {
	if (paid) {
		return (
			<span className='text-xs font-semibold' style={{ color: SUCCESS }}>
				مدفوع{cash ? ' نقداً' : ''}
			</span>
		);
	}

	return (
		<span
			className='text-xs font-semibold'
			style={{ color: 'var(--sp-danger)' }}
		>
			{cash ? 'نقداً — غير مستلم' : 'غير مدفوع'}
		</span>
	);
}

function Empty({ filter }: { filter: HistoryFilter }) {
	const message =
		filter === 'all'
			? 'لم تقم بأي حجز حتى الآن. ابحث عن أقرب موقف لتبدأ.'
			: 'لا توجد نتائج ضمن هذا التصنيف.';

	return (
		<div className='flex flex-col items-center px-8 pt-14 text-center'>
			<div
				className='sp-animate-scale flex size-14 items-center justify-center rounded-full'
				style={{ background: 'var(--sp-accent-soft)' }}
			>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					className='size-7'
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

			<p
				className='sp-animate-in mt-5 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)' }}
			>
				{message}
			</p>
		</div>
	);
}
