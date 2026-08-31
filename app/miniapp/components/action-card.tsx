'use client';

import Link from 'next/link';

import { hapticImpact } from '@/app/lib/miniapp/telegram';

export type ActionIcon = 'pin' | 'ticket' | 'building' | 'clock';

/**
 * Primary navigation affordance for the Mini App.
 *
 * A client component purely so the tap can fire haptic feedback — the physical
 * tick on press is what separates a Mini App from a website in a frame.
 */
export function ActionCard({
	href,
	title,
	description,
	icon,
	emphasis = false,
}: {
	href: string;
	title: string;
	description: string;
	icon: ActionIcon;
	/** Renders the card in the accent colour, for the screen's main action. */
	emphasis?: boolean;
}) {
	return (
		<Link
			href={href}
			onClick={() => hapticImpact('light')}
			className='sp-pressable flex items-center gap-4 rounded-2xl px-4 py-4'
			style={
				emphasis
					? {
							background: 'var(--sp-accent)',
							color: 'var(--sp-accent-text)',
						}
					: {
							background: 'var(--sp-surface)',
							border:
								'1px solid color-mix(in srgb, var(--sp-text) 8%, transparent)',
						}
			}
		>
			<span
				className='flex size-11 shrink-0 items-center justify-center rounded-xl'
				style={{
					background: emphasis
						? 'color-mix(in srgb, var(--sp-accent-text) 16%, transparent)'
						: 'color-mix(in srgb, var(--sp-accent) 16%, transparent)',
				}}
			>
				<ActionGlyph
					icon={icon}
					color={emphasis ? 'currentColor' : 'var(--sp-accent)'}
				/>
			</span>

			<span className='min-w-0 flex-1'>
				<span className='block truncate text-base font-semibold leading-tight'>
					{title}
				</span>
				<span
					className='mt-0.5 block truncate text-sm'
					style={{
						color: emphasis
							? 'color-mix(in srgb, currentColor 72%, transparent)'
							: 'var(--sp-muted)',
					}}
				>
					{description}
				</span>
			</span>

			<svg
				viewBox='0 0 24 24'
				fill='none'
				className='size-5 shrink-0 opacity-40 rtl:rotate-180'
				aria-hidden='true'
			>
				<path
					d='m9 5 7 7-7 7'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
		</Link>
	);
}

function ActionGlyph({ icon, color }: { icon: ActionIcon; color: string }) {
	const common = {
		stroke: color,
		strokeWidth: 1.9,
		strokeLinecap: 'round' as const,
		strokeLinejoin: 'round' as const,
	};

	return (
		<svg viewBox='0 0 24 24' fill='none' className='size-5' aria-hidden='true'>
			{icon === 'pin' && (
				<>
					<path
						d='M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z'
						{...common}
					/>
					<circle cx='12' cy='10' r='2.6' {...common} />
				</>
			)}
			{icon === 'ticket' && (
				<>
					<path
						d='M4 8.5A1.5 1.5 0 0 1 5.5 7h13A1.5 1.5 0 0 1 20 8.5v2a2 2 0 0 0 0 4v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2 2 0 0 0 0-4v-2Z'
						{...common}
					/>
					<path d='M14 7v10' strokeDasharray='2 2.4' {...common} />
				</>
			)}
			{icon === 'building' && (
				<>
					<path
						d='M4 21V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V21'
						{...common}
					/>
					<path d='M14 10h4.5A1.5 1.5 0 0 1 20 11.5V21M3 21h18' {...common} />
					<path d='M7.5 8h3M7.5 12h3M7.5 16h3' {...common} />
				</>
			)}
			{icon === 'clock' && (
				<>
					<circle cx='12' cy='12' r='8.5' {...common} />
					<path d='M12 7.5V12l3 1.8' {...common} />
				</>
			)}
		</svg>
	);
}
