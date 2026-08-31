'use client';

import {
	availabilityTone,
	formatDistance,
	formatPrice,
} from '@/app/lib/miniapp/format';
import { hapticImpact } from '@/app/lib/miniapp/telegram';
import type { NearbyPark } from '@/app/types/miniapp';

const TONE_COLOR: Record<ReturnType<typeof availabilityTone>, string> = {
	plenty: '#22c55e',
	limited: 'var(--sp-accent)',
	full: 'var(--sp-danger)',
};

const TONE_LABEL: Record<ReturnType<typeof availabilityTone>, string> = {
	plenty: 'متاح',
	limited: 'على وشك الامتلاء',
	full: 'ممتلئ',
};

/**
 * One garage in the nearby list.
 *
 * Ordered by what a driver decides on: how far away it is, whether there is
 * room, and what it costs — in that order, largest type first.
 */
export function ParkCard({
	park,
	selected,
	onSelect,
}: {
	park: NearbyPark;
	selected: boolean;
	onSelect: (park: NearbyPark) => void;
}) {
	const tone = availabilityTone(park.free_spaces, park.capacity);
	const isFull = tone === 'full';

	return (
		<button
			type='button'
			disabled={isFull}
			aria-pressed={selected}
			onClick={() => {
				hapticImpact('light');
				onSelect(park);
			}}
			className='sp-pressable w-full rounded-2xl px-4 py-3.5 text-left disabled:opacity-55'
			style={{
				background: 'var(--sp-surface)',
				border: selected
					? '1.5px solid var(--sp-accent)'
					: '1px solid color-mix(in srgb, var(--sp-text) 8%, transparent)',
			}}
		>
			<div className='flex items-start gap-3'>
				<span
					className='mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl'
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
						<path
							d='M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z'
							stroke='var(--sp-accent)'
							strokeWidth='1.9'
							strokeLinejoin='round'
						/>
						<circle
							cx='12'
							cy='10'
							r='2.6'
							stroke='var(--sp-accent)'
							strokeWidth='1.9'
						/>
					</svg>
				</span>

				<span className='min-w-0 flex-1'>
					<span className='flex items-baseline justify-between gap-2'>
						<span className='truncate text-base font-semibold leading-tight'>
							{park.name}
						</span>
						<span
							className='shrink-0 text-sm font-medium tabular-nums'
							style={{ color: 'var(--sp-muted)' }}
						>
							{formatDistance(park.distance_meters)}
						</span>
					</span>

					<span className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5'>
						<span className='inline-flex items-center gap-1.5'>
							<span
								className='size-2 rounded-full'
								style={{ background: TONE_COLOR[tone] }}
							/>
							<span
								className='text-sm font-medium'
								style={{ color: TONE_COLOR[tone] }}
							>
								{isFull ? TONE_LABEL[tone] : `${park.free_spaces} متاح`}
							</span>
						</span>

						<span className='text-sm' style={{ color: 'var(--sp-muted)' }}>
							{formatPrice(park.price)}
						</span>
					</span>
				</span>
			</div>
		</button>
	);
}
