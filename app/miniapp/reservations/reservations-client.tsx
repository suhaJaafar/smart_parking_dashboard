'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import {
	admitReservationAction,
	cancelHoldAction,
	exitReservationAction,
	listOwnerReservationsAction,
} from '@/app/lib/miniapp/owner-actions';
import { messageForError } from '@/app/lib/miniapp/format';
import {
	confirmAction,
	hapticImpact,
	hapticNotification,
	hapticSelection,
} from '@/app/lib/miniapp/telegram';
import type {
	OwnerReservation,
	ReservationFilter,
} from '@/app/types/reservation';

import { ReservationCard } from './reservation-card';
import { PlateSheet } from './plate-sheet';

/** Only the buckets an owner acts on day-to-day. */
const TABS: { value: ReservationFilter; label: string }[] = [
	{ value: 'live', label: 'الآن' },
	{ value: 'waiting', label: 'بالانتظار' },
	{ value: 'active', label: 'بالداخل' },
	{ value: 'history', label: 'السجل' },
];

/** Owner-facing copy for action failures. */
function messageForOwnerError(code: string): string {
	switch (code) {
		case 'car_in_other_park':
			return 'سيارة الزبون مسجّلة داخل موقف آخر. يجب إخراجها من ذلك الموقف أولاً.';
		case 'park_full':
			return 'الموقف ممتلئ — لا توجد مساحة لإدخال السيارة.';
		case 'plate_prefix':
			return 'لا توجد سيارة مسجّلة لهذا الزبون. أدخِل رقم اللوحة.';
		case 'invalid_state':
			return 'تغيّرت حالة هذا الحجز — تم تحديث القائمة.';
		case 'forbidden':
			return 'لا يمكنك إدارة هذا الحجز.';
		default:
			return messageForError(code);
	}
}

export function ReservationsClient({
	initialReservations,
	parks,
}: {
	initialReservations: OwnerReservation[];
	parks: { id: string; name: string }[];
}) {
	const [filter, setFilter] = useState<ReservationFilter>('live');
	// undefined = every garage. Only meaningful when the owner has more than one.
	const [parkId, setParkId] = useState<string | undefined>(undefined);
	const [reservations, setReservations] =
		useState<OwnerReservation[]>(initialReservations);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [plateFor, setPlateFor] = useState<OwnerReservation | null>(null);
	const [isPending, startTransition] = useTransition();

	const errorRef = useRef<HTMLDivElement | null>(null);

	// A failed action is reported above the list, which can sit off-screen on a
	// phone — without this the tap looks like it did nothing at all.
	useEffect(() => {
		if (error) {
			errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [error]);

	/** Re-fetch the current bucket. Used after every mutation. */
	const refresh = useCallback(
		async (next: ReservationFilter, park: string | undefined) => {
			const result = await listOwnerReservationsAction(next, park);
			if (!result.ok) {
				setError(result.error);
				return;
			}
			setReservations(result.data);
		},
		[],
	);

	const selectTab = (next: ReservationFilter) => {
		hapticSelection();
		setFilter(next);
		setError(null);
		startTransition(async () => {
			await refresh(next, parkId);
		});
	};

	const selectPark = (next: string | undefined) => {
		hapticSelection();
		setParkId(next);
		setError(null);
		startTransition(async () => {
			await refresh(filter, next);
		});
	};

	/** Run a mutation, then resync the list so the UI can't drift. */
	const run = useCallback(
		(id: string, mutate: () => Promise<{ ok: boolean; error?: string }>) => {
			setBusyId(id);
			setError(null);

			startTransition(async () => {
				const result = await mutate();

				if (!result.ok) {
					hapticNotification('error');
					setError(result.error ?? 'request_failed');
				} else {
					hapticNotification('success');
				}

				await refresh(filter, parkId);
				setBusyId(null);
			});
		},
		[filter, parkId, refresh],
	);

	const admit = useCallback(
		(
			reservation: OwnerReservation,
			plate?: { plate_prefix: string; car_number: string },
		) => {
			run(reservation.id, () => admitReservationAction(reservation.id, plate));
		},
		[run],
	);

	const onAdmit = (reservation: OwnerReservation) => {
		// No vehicle on file — ask for the plate first, exactly as the bot's
		// car-entry flow does before it can park anything.
		if (!reservation.car) {
			setPlateFor(reservation);
			return;
		}
		admit(reservation);
	};

	const onExit = (reservation: OwnerReservation) => {
		void (async () => {
			const ok = await confirmAction(
				`إخراج ${reservation.car?.plate ?? 'هذه السيارة'} وإنهاء الحجز؟`,
			);
			if (!ok) return;
			run(reservation.id, () => exitReservationAction(reservation.id));
		})();
	};

	const onCancel = (reservation: OwnerReservation) => {
		void (async () => {
			const ok = await confirmAction('إلغاء هذا الحجز؟ سيتم تحرير المكان.');
			if (!ok) return;
			run(reservation.id, () => cancelHoldAction(reservation.id));
		})();
	};

	return (
		<div className='pb-6'>
			<nav
				className='sp-animate-in mx-5 mt-4 flex gap-1 rounded-xl p-1'
				style={{ background: 'var(--sp-surface-alt)' }}
				aria-label='تصفية الحجوزات'
			>
				{TABS.map((tab) => {
					const selected = filter === tab.value;
					return (
						<button
							key={tab.value}
							type='button'
							aria-pressed={selected}
							onClick={() => selectTab(tab.value)}
							className='flex-1 rounded-lg py-2 text-sm font-semibold transition-colors'
							style={
								selected
									? { background: 'var(--sp-bg)', color: 'var(--sp-text)' }
									: { color: 'var(--sp-muted)' }
							}
						>
							{tab.label}
						</button>
					);
				})}
			</nav>

			{/* Only worth the space once the owner actually has a choice. */}
			{parks.length > 1 && (
				<div className='sp-animate-in mt-3 flex gap-2 overflow-x-auto px-5 pb-1'>
					<ParkChip
						label='كل المواقف'
						selected={parkId === undefined}
						onSelect={() => selectPark(undefined)}
					/>
					{parks.map((park) => (
						<ParkChip
							key={park.id}
							label={park.name}
							selected={parkId === park.id}
							onSelect={() => selectPark(park.id)}
						/>
					))}
				</div>
			)}

			{error && (
				<div
					ref={errorRef}
					role='alert'
					className='sp-animate-in mx-5 mt-3 flex items-start gap-3 rounded-xl px-4 py-3'
					style={{
						background: 'color-mix(in srgb, var(--sp-danger) 12%, transparent)',
					}}
				>
					<p className='flex-1 text-sm' style={{ color: 'var(--sp-danger)' }}>
						{messageForOwnerError(error)}
					</p>
					<button
						type='button'
						onClick={() => {
							hapticImpact('light');
							setError(null);
						}}
						aria-label='Dismiss'
						className='shrink-0 text-sm font-semibold opacity-70'
						style={{ color: 'var(--sp-danger)' }}
					>
						✕
					</button>
				</div>
			)}

			<div className='mt-4 px-5'>
				{isPending && reservations.length === 0 ? (
					<div className='sp-stagger space-y-3'>
						{[0, 1, 2].map((i) => (
							<div key={i} className='sp-skeleton h-28 rounded-2xl' />
						))}
					</div>
				) : reservations.length === 0 ? (
					<EmptyBucket filter={filter} />
				) : (
					<div
						// Re-keying on the filter replays the entry animation, so
						// switching tabs reads as new content arriving.
						key={filter}
						className='sp-stagger space-y-3'
					>
						{reservations.map((reservation) => (
							<ReservationCard
								key={reservation.id}
								reservation={reservation}
								busy={busyId === reservation.id}
								onAdmit={onAdmit}
								onExit={onExit}
								onCancel={onCancel}
							/>
						))}
					</div>
				)}
			</div>

			{plateFor && (
				<PlateSheet
					customerName={plateFor.customer?.name ?? 'this customer'}
					onDismiss={() => setPlateFor(null)}
					onSubmit={(plate) => {
						const target = plateFor;
						setPlateFor(null);
						admit(target, plate);
					}}
				/>
			)}
		</div>
	);
}

function ParkChip({
	label,
	selected,
	onSelect,
}: {
	label: string;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type='button'
			aria-pressed={selected}
			onClick={onSelect}
			className='sp-pressable shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium'
			style={
				selected
					? { background: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }
					: {
							background: 'var(--sp-surface)',
							color: 'var(--sp-muted)',
							border:
								'1px solid color-mix(in srgb, var(--sp-text) 10%, transparent)',
						}
			}
		>
			{label}
		</button>
	);
}

function EmptyBucket({ filter }: { filter: ReservationFilter }) {
	const copy: Record<string, string> = {
		live: 'لا أحد بالانتظار أو داخل الموقف حالياً.',
		waiting: 'لا يوجد أحد بانتظار الدخول.',
		active: 'لا توجد سيارات داخل مواقفك.',
		history: 'لا توجد حجوزات مكتملة أو ملغاة بعد.',
		all: 'لا توجد حجوزات بعد.',
	};

	return (
		<div className='flex flex-col items-center px-6 py-14 text-center'>
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
						d='M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v2a2 2 0 0 0 0 4v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2 2 0 0 0 0-4v-2Z'
						stroke='var(--sp-accent)'
						strokeWidth='1.8'
						strokeLinejoin='round'
					/>
				</svg>
			</div>
			<p
				className='sp-animate-in mt-4 max-w-xs text-sm'
				style={{ color: 'var(--sp-muted)' }}
			>
				{copy[filter] ?? copy.all}
			</p>
		</div>
	);
}
