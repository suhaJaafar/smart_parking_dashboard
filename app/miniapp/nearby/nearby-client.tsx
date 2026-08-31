'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
	findNearbyParksAction,
	reserveParkAction,
} from '@/app/lib/miniapp/actions';
import {
	directionsUrl,
	type NavigationApp,
} from '@/app/lib/miniapp/directions';
import {
	formatDistance,
	formatPrice,
	messageForError,
} from '@/app/lib/miniapp/format';
import { resolvePosition } from '@/app/lib/miniapp/location';
import {
	getWebApp,
	hapticImpact,
	hapticNotification,
	hapticSelection,
	openExternalLink,
} from '@/app/lib/miniapp/telegram';
import type { Coordinates, NearbyPark } from '@/app/types/miniapp';

import { ParksMap } from '../components/map';
import { ParkCard } from '../components/park-card';

/** How the results are presented. Persisted only for the session. */
type ViewMode = 'list' | 'map';

/**
 * Screen phases. `locating` and `loading` are distinct because they fail for
 * completely different reasons and need different recovery copy.
 */
type Phase = 'locating' | 'loading' | 'ready' | 'denied' | 'error';

export function NearbyClient() {
	const router = useRouter();

	const [phase, setPhase] = useState<Phase>('locating');
	const [parks, setParks] = useState<NearbyPark[]>([]);
	const [selected, setSelected] = useState<NearbyPark | null>(null);
	const [errorCode, setErrorCode] = useState<string | null>(null);
	const [errorDetail, setErrorDetail] = useState<string | undefined>(undefined);
	const [view, setView] = useState<ViewMode>('list');
	// Mirrors coordsRef into render, which the ref alone cannot do.
	const [origin, setOrigin] = useState<Coordinates | null>(null);
	const [isReserving, startReserving] = useTransition();

	// Latest coords, kept for the "refresh" affordance.
	const coordsRef = useRef<Coordinates | null>(null);

	/* ----------------------------- Data loading ---------------------------- */

	const loadParks = useCallback(async (coords: Coordinates) => {
		coordsRef.current = coords;
		setOrigin(coords);
		setPhase('loading');

		const result = await findNearbyParksAction(coords);

		if (!result.ok) {
			setErrorCode(result.error);
			setPhase('error');
			return;
		}

		setParks(result.data);
		setSelected(null);
		setPhase('ready');
	}, []);

	/**
	 * Locate, then search.
	 *
	 * `fresh` is what the تحديث button passes: it bypasses the cached fix and
	 * takes a new reading. The default path reuses a recent fix, so re-opening
	 * this screen does not re-open the permission prompt.
	 */
	const locateAndLoad = useCallback(
		async ({ fresh = false }: { fresh?: boolean } = {}) => {
			const outcome = await resolvePosition({
				maxAgeMs: fresh ? 0 : undefined,
			});

			if (!outcome.ok) {
				setPhase(outcome.reason === 'denied' ? 'denied' : 'error');
				setErrorCode(
					outcome.reason === 'denied' ? 'location_denied' : 'invalid_location',
				);
				return;
			}

			await loadParks(outcome.coords);
		},
		[loadParks],
	);

	/** User-initiated retry — always takes a fresh reading. */
	const retry = useCallback(() => {
		setPhase('locating');
		setErrorCode(null);
		void locateAndLoad({ fresh: true });
	}, [locateAndLoad]);

	// Ask for a fix as soon as the screen opens — a parking app that makes you
	// tap "find me" first is just friction. Deferred a tick so no state
	// transition happens synchronously inside the effect body.
	useEffect(() => {
		const id = setTimeout(() => void locateAndLoad(), 0);
		return () => clearTimeout(id);
	}, [locateAndLoad]);

	/* ------------------------------- Reserving ----------------------------- */

	const reserve = useCallback(
		(park: NearbyPark) => {
			startReserving(async () => {
				const result = await reserveParkAction({ parkId: park.id });

				if (!result.ok) {
					hapticNotification('error');
					setErrorCode(result.error);
					setErrorDetail(result.detail);
					// Only a genuinely full garage means the list is stale. Being
					// blocked by your own reservation elsewhere does not, and
					// reloading on that would just hide the message.
					if (result.error === 'unavailable' && coordsRef.current) {
						void loadParks(coordsRef.current);
					}
					return;
				}

				hapticNotification('success');

				// Release Telegram's button *before* navigating. Its spinner is
				// driven by the transition, and the transition stays pending
				// until the destination has server-rendered — so leaving it to
				// the unmount cleanup makes the button spin long after the
				// reservation is already confirmed.
				const button = getWebApp()?.MainButton;
				button?.hideProgress();
				button?.hide();

				// The action revalidates `/miniapp` server-side, so no
				// `router.refresh()` is needed — that would only add a second
				// round trip and prolong the pending transition.
				router.replace('/miniapp');
			});
		},
		[loadParks, router],
	);

	/* -------------------- Telegram MainButton drives the CTA ---------------- */

	// Using Telegram's own button (rather than an in-page one) is what makes the
	// action feel native: it sits in the client chrome and shows a real spinner.
	useEffect(() => {
		const app = getWebApp();
		const button = app?.MainButton;
		if (!button) return;

		if (!selected) {
			button.hide();
			return;
		}

		const onClick = () => reserve(selected);

		button.setText(`احجز · ${selected.name}`);
		button.onClick(onClick);
		button.show();

		return () => {
			button.offClick(onClick);
			button.hide();
		};
	}, [selected, reserve]);

	// Progress state is a separate effect so toggling it never re-registers the
	// click handler above.
	useEffect(() => {
		const button = getWebApp()?.MainButton;
		if (!button || !selected) return;

		if (isReserving) {
			button.showProgress(false);
			button.disable();
		} else {
			button.hideProgress();
			button.enable();
		}

		// Telegram's button lives outside React, so it keeps whatever state it
		// was left in. Clearing on teardown guarantees no orphaned spinner.
		return () => {
			button.hideProgress();
			button.enable();
		};
	}, [isReserving, selected]);

	/* -------------------------------- Render ------------------------------- */

	return (
		<div className='pb-28'>
			{errorCode && phase === 'ready' && (
				<ErrorBanner
					message={messageForError(errorCode, errorDetail)}
					onDismiss={() => setErrorCode(null)}
				/>
			)}

			{(phase === 'locating' || phase === 'loading') && (
				<LoadingState
					label={
						phase === 'locating' ? 'جارٍ تحديد موقعك…' : 'نبحث عن مواقف قريبة…'
					}
				/>
			)}

			{phase === 'denied' && <LocationDenied onRetry={retry} />}

			{phase === 'error' && (
				<ErrorState
					message={messageForError(errorCode ?? 'request_failed')}
					onRetry={retry}
				/>
			)}

			{phase === 'ready' && parks.length === 0 && (
				<EmptyState onRetry={retry} />
			)}

			{phase === 'ready' && parks.length > 0 && (
				<>
					<div className='flex items-center justify-between gap-3 px-5 pb-3 pt-1'>
						<p className='text-sm' style={{ color: 'var(--sp-muted)' }}>
							{parks.length} موقف قريب منك
						</p>

						<div className='flex items-center gap-3'>
							<ViewToggle
								value={view}
								onChange={(next) => {
									hapticSelection();
									setView(next);
								}}
							/>
							<button
								type='button'
								onClick={() => {
									hapticImpact('light');
									retry();
								}}
								className='text-sm font-semibold'
								style={{ color: 'var(--sp-link)' }}
							>
								تحديث
							</button>
						</div>
					</div>

					{view === 'map' ? (
						<div className='sp-animate-in space-y-3 px-5'>
							<ParksMap
								parks={parks}
								origin={origin}
								selected={selected}
								onSelect={(park) => {
									hapticSelection();
									setSelected(park);
								}}
							/>

							{selected ? (
								<SelectedParkSheet
									park={selected}
									origin={origin}
									isReserving={isReserving}
									onReserve={() => reserve(selected)}
								/>
							) : (
								<p
									className='px-1 pb-1 text-center text-sm'
									style={{ color: 'var(--sp-muted)' }}
								>
									اضغط على أي موقف في الخريطة لعرض تفاصيله والاتجاهات إليه.
								</p>
							)}
						</div>
					) : (
						<div className='sp-stagger space-y-3 px-5'>
							{parks.map((park) => (
								<ParkCard
									key={park.id}
									park={park}
									selected={selected?.id === park.id}
									onSelect={setSelected}
								/>
							))}
						</div>
					)}

					{/* Fallback CTA for clients without a usable MainButton. */}
					{selected && view === 'list' && !getWebApp()?.MainButton && (
						<div className='px-5 pt-5'>
							<button
								type='button'
								disabled={isReserving}
								onClick={() => reserve(selected)}
								className='sp-button w-full px-6 py-3.5 text-sm'
							>
								{isReserving ? 'جارٍ الحجز…' : `احجز · ${selected.name}`}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}

/* -------------------------------- Map bits ------------------------------- */

/** Segmented control. Two options, so a switch reads clearer than a dropdown. */
function ViewToggle({
	value,
	onChange,
}: {
	value: ViewMode;
	onChange: (next: ViewMode) => void;
}) {
	const options: { value: ViewMode; label: string }[] = [
		{ value: 'list', label: 'قائمة' },
		{ value: 'map', label: 'خريطة' },
	];

	return (
		<div
			className='flex rounded-full p-0.5'
			style={{ background: 'var(--sp-surface-alt)' }}
		>
			{options.map((option) => {
				const active = option.value === value;

				return (
					<button
						key={option.value}
						type='button'
						onClick={() => onChange(option.value)}
						aria-pressed={active}
						className='sp-pressable rounded-full px-3 py-1 text-xs font-semibold'
						style={
							active
								? {
										background: 'var(--sp-accent)',
										color: 'var(--sp-accent-text)',
									}
								: { color: 'var(--sp-muted)' }
						}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}

/**
 * Detail for the pin the driver just tapped.
 *
 * Sits under the map rather than floating over it: an overlay would cover the
 * very pins they are comparing, and on a short phone it would leave the map
 * unusable.
 */
function SelectedParkSheet({
	park,
	origin,
	isReserving,
	onReserve,
}: {
	park: NearbyPark;
	origin: Coordinates | null;
	isReserving: boolean;
	onReserve: () => void;
}) {
	const [choosingApp, setChoosingApp] = useState(false);
	const free = park.free_spaces ?? 0;
	const hasPoint = park.latitude != null && park.longitude != null;

	const navigate = (app: NavigationApp) => {
		if (park.latitude == null || park.longitude == null) return;

		hapticImpact('medium');
		setChoosingApp(false);
		// Through Telegram so the nav app opens outside the WebView and the
		// Mini App session is still alive when the driver comes back.
		openExternalLink(
			directionsUrl(
				app,
				{ latitude: park.latitude, longitude: park.longitude },
				origin,
			),
		);
	};

	return (
		<div className='sp-card sp-animate-in px-4 py-3.5'>
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0'>
					<h2 className='truncate text-base font-semibold'>{park.name}</h2>
					<p className='mt-1 text-sm' style={{ color: 'var(--sp-muted)' }}>
						{formatDistance(park.distance_meters)} · {formatPrice(park.price)}
					</p>
				</div>

				<span
					className='shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold'
					style={{
						background: `color-mix(in srgb, ${
							free > 0 ? '#22c55e' : 'var(--sp-danger)'
						} 14%, transparent)`,
						color: free > 0 ? '#22c55e' : 'var(--sp-danger)',
					}}
				>
					{free > 0 ? `${free} متاح` : 'ممتلئ'}
				</span>
			</div>

			<div className='mt-3.5 flex gap-2'>
				<button
					type='button'
					disabled={isReserving || free < 1}
					onClick={onReserve}
					className='sp-button flex-1 px-5 py-2.5 text-sm disabled:opacity-50'
				>
					{isReserving ? 'جارٍ الحجز…' : 'احجز'}
				</button>

				<button
					type='button'
					disabled={!hasPoint}
					onClick={() => {
						hapticImpact('light');
						setChoosingApp((open) => !open);
					}}
					className='sp-button-ghost flex-1 px-5 py-2.5 text-sm disabled:opacity-50'
				>
					الاتجاهات
				</button>
			</div>

			{choosingApp && (
				<div className='sp-animate-in mt-2.5 grid grid-cols-2 gap-2'>
					<button
						type='button'
						onClick={() => navigate('google')}
						className='sp-button-ghost px-4 py-2.5 text-sm'
					>
						خرائط Google
					</button>
					<button
						type='button'
						onClick={() => navigate('waze')}
						className='sp-button-ghost px-4 py-2.5 text-sm'
					>
						Waze
					</button>
				</div>
			)}
		</div>
	);
}

/* ------------------------------ Sub-states ------------------------------- */

function LoadingState({ label }: { label: string }) {
	return (
		<div className='px-5'>
			<p
				className='sp-animate-in pb-4 pt-1 text-sm'
				style={{ color: 'var(--sp-muted)' }}
			>
				{label}
			</p>
			<div className='sp-stagger space-y-3'>
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className='sp-skeleton h-20 rounded-2xl' />
				))}
			</div>
		</div>
	);
}

/**
 * Permission was refused.
 *
 * Once a refusal is recorded the browser stops showing its prompt, so a bare
 * "try again" button looks broken — the user has to change the setting first.
 * These are the actual steps, and the retry then picks the new answer up.
 */
function LocationDenied({ onRetry }: { onRetry: () => void }) {
	return (
		<div className='flex flex-col items-center px-8 pt-12 text-center'>
			<div
				className='sp-animate-scale flex size-14 items-center justify-center rounded-full'
				style={{
					background: 'color-mix(in srgb, var(--sp-danger) 12%, transparent)',
				}}
			>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					className='size-7'
					aria-hidden='true'
				>
					<path
						d='M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z'
						stroke='var(--sp-danger)'
						strokeWidth='1.8'
						strokeLinejoin='round'
					/>
					<path
						d='m4 4 16 16'
						stroke='var(--sp-danger)'
						strokeWidth='1.8'
						strokeLinecap='round'
					/>
				</svg>
			</div>

			<h2 className='sp-animate-in mt-5 text-base font-semibold'>
				خدمة الموقع مغلقة
			</h2>
			<p
				className='sp-animate-in mt-2 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)', animationDelay: '80ms' }}
			>
				يحتاج التطبيق إلى موقعك لعرض المواقف القريبة منك. بعد رفض الإذن لن يظهر
				الطلب مرة أخرى تلقائياً، لذلك فعّله يدوياً:
			</p>

			<div
				className='sp-card sp-animate-in mt-6 w-full max-w-xs px-5 py-4 text-right'
				style={{ animationDelay: '150ms' }}
			>
				<p
					className='text-xs font-semibold'
					style={{ color: 'var(--sp-muted)' }}
				>
					على آيفون
				</p>
				<p className='mt-1.5 text-sm leading-relaxed'>
					الإعدادات ← الخصوصية والأمان ← خدمات الموقع ← Telegram ←
					<span className='font-semibold'> أثناء استخدام التطبيق</span>
				</p>

				<p
					className='sp-divider mt-3 border-t pt-3 text-xs font-semibold'
					style={{ color: 'var(--sp-muted)' }}
				>
					على أندرويد
				</p>
				<p className='mt-1.5 text-sm leading-relaxed'>
					الإعدادات ← التطبيقات ← Telegram ← الأذونات ←
					<span className='font-semibold'> الموقع</span>
				</p>
			</div>

			<button
				type='button'
				onClick={() => {
					hapticImpact('light');
					onRetry();
				}}
				className='sp-button sp-animate-in mt-6 w-full max-w-xs px-6 py-3 text-sm'
				style={{ animationDelay: '220ms' }}
			>
				فعّلتها — أعد المحاولة
			</button>
		</div>
	);
}

function EmptyState({ onRetry }: { onRetry: () => void }) {
	return (
		<CenteredNotice
			title='لا توجد مواقف قريبة'
			body='لم نعثر على مواقف فيها أماكن متاحة ضمن ٥ كم من موقعك.'
			actionLabel='بحث من جديد'
			onAction={onRetry}
		/>
	);
}

function ErrorState({
	message,
	onRetry,
}: {
	message: string;
	onRetry: () => void;
}) {
	return (
		<CenteredNotice
			title='حدث خطأ ما'
			body={message}
			actionLabel='إعادة المحاولة'
			onAction={onRetry}
		/>
	);
}

function CenteredNotice({
	title,
	body,
	actionLabel,
	onAction,
}: {
	title: string;
	body: string;
	actionLabel: string;
	onAction: () => void;
}) {
	return (
		<div className='flex flex-col items-center px-8 pt-16 text-center'>
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
						d='M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z'
						stroke='var(--sp-accent)'
						strokeWidth='1.8'
						strokeLinejoin='round'
					/>
					<circle
						cx='12'
						cy='10'
						r='2.6'
						stroke='var(--sp-accent)'
						strokeWidth='1.8'
					/>
				</svg>
			</div>

			<h2 className='sp-animate-in mt-5 text-base font-semibold'>{title}</h2>
			<p
				className='sp-animate-in mt-2 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)', animationDelay: '80ms' }}
			>
				{body}
			</p>

			<button
				type='button'
				onClick={() => {
					hapticImpact('medium');
					onAction();
				}}
				className='sp-button sp-animate-in mt-6 px-6 py-3 text-sm'
				style={{ animationDelay: '140ms' }}
			>
				{actionLabel}
			</button>
		</div>
	);
}

function ErrorBanner({
	message,
	onDismiss,
}: {
	message: string;
	onDismiss: () => void;
}) {
	return (
		<div
			role='alert'
			className='sp-animate-in mx-5 mb-3 flex items-start gap-3 rounded-xl px-4 py-3'
			style={{
				background: 'color-mix(in srgb, var(--sp-danger) 12%, transparent)',
			}}
		>
			<p className='flex-1 text-sm' style={{ color: 'var(--sp-danger)' }}>
				{message}
			</p>
			<button
				type='button'
				onClick={onDismiss}
				aria-label='إغلاق'
				className='shrink-0 text-sm font-semibold opacity-70'
				style={{ color: 'var(--sp-danger)' }}
			>
				✕
			</button>
		</div>
	);
}
