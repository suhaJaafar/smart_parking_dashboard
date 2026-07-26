'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type { ReservationStatsScope } from '@/app/types/reservation-stats';

export interface StatsParkOption {
	id: string;
	name: string;
}

/**
 * Filter bar for the reservations-analytics page: date range, park picker
 * and (for users who hold both admin and space-owner roles) a scope toggle.
 *
 * State lives in the URL so the server component re-fetches with new
 * params on every apply. Local state buffers pending edits so a user can
 * tweak multiple fields before firing a single navigation.
 *
 * The outer component keys the inner one on the URL-derived values so that
 * any external navigation (preset button, reset, cross-page nav) remounts
 * the inputs with fresh initial state — no `setState`-in-effect required.
 */
export function StatsFilters(props: StatsFiltersProps) {
	const key = `${props.from}|${props.to}|${props.parkId ?? ''}|${props.scope}`;
	return <StatsFiltersInner key={key} {...props} />;
}

interface StatsFiltersProps {
	from: string;
	to: string;
	parkId: string | null;
	parks: readonly StatsParkOption[];
	scope: ReservationStatsScope;
	canToggleScope: boolean;
	basePath?: string;
}

function StatsFiltersInner({
	from,
	to,
	parkId,
	parks,
	scope,
	canToggleScope,
	basePath = '/dashboard/reservations/stats',
}: StatsFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [draftFrom, setDraftFrom] = useState(from);
	const [draftTo, setDraftTo] = useState(to);
	const [draftPark, setDraftPark] = useState(parkId ?? '');

	function apply(
		next: Partial<{
			from: string;
			to: string;
			parkId: string;
			scope: ReservationStatsScope;
		}>,
	) {
		const params = new URLSearchParams(searchParams.toString());
		const nextFrom = next.from ?? draftFrom;
		const nextTo = next.to ?? draftTo;
		const nextPark = next.parkId ?? draftPark;
		const nextScope = next.scope ?? scope;

		if (nextFrom) params.set('from', nextFrom);
		else params.delete('from');
		if (nextTo) params.set('to', nextTo);
		else params.delete('to');
		if (nextPark) params.set('park_id', nextPark);
		else params.delete('park_id');
		if (canToggleScope) {
			if (nextScope !== 'admin') params.set('scope', nextScope);
			else params.delete('scope');
		}

		const qs = params.toString();
		router.push(qs ? `${basePath}?${qs}` : basePath);
	}

	function preset(days: number) {
		const now = new Date();
		const start = new Date(now);
		start.setDate(now.getDate() - (days - 1));
		apply({
			from: toIsoDate(start),
			to: toIsoDate(now),
		});
	}

	function clear() {
		router.push(basePath);
	}

	return (
		<section className='rounded-xl border border-black/[.06] bg-white p-4 shadow-sm dark:border-white/[.08] dark:bg-zinc-950'>
			<div className='flex flex-wrap items-end gap-3'>
				<label className='flex flex-col gap-1 text-xs'>
					<span className='font-medium text-zinc-600 dark:text-zinc-400'>
						From
					</span>
					<input
						type='date'
						value={draftFrom}
						onChange={(e) => setDraftFrom(e.target.value)}
						max={draftTo || undefined}
						className='rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950'
					/>
				</label>

				<label className='flex flex-col gap-1 text-xs'>
					<span className='font-medium text-zinc-600 dark:text-zinc-400'>
						To
					</span>
					<input
						type='date'
						value={draftTo}
						onChange={(e) => setDraftTo(e.target.value)}
						min={draftFrom || undefined}
						className='rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950'
					/>
				</label>

				{parks.length > 0 ? (
					<label className='flex flex-col gap-1 text-xs'>
						<span className='font-medium text-zinc-600 dark:text-zinc-400'>
							Garage
						</span>
						<select
							value={draftPark}
							onChange={(e) => setDraftPark(e.target.value)}
							className='rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950'
						>
							<option value=''>All garages</option>
							{parks.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name}
								</option>
							))}
						</select>
					</label>
				) : null}

				{canToggleScope ? (
					<div
						role='tablist'
						aria-label='Report scope'
						className='inline-flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 text-xs dark:border-zinc-800 dark:bg-zinc-950'
					>
						<ScopeButton
							active={scope === 'admin'}
							onClick={() => apply({ scope: 'admin' })}
						>
							All parks
						</ScopeButton>
						<ScopeButton
							active={scope === 'owner'}
							onClick={() => apply({ scope: 'owner' })}
						>
							My parks
						</ScopeButton>
					</div>
				) : null}

				<div className='ml-auto flex flex-wrap items-center gap-2'>
					<PresetButton onClick={() => preset(7)}>7d</PresetButton>
					<PresetButton onClick={() => preset(30)}>30d</PresetButton>
					<PresetButton onClick={() => preset(90)}>90d</PresetButton>
					<button
						type='button'
						onClick={clear}
						className='rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
					>
						Reset
					</button>
					<button
						type='button'
						onClick={() => apply({})}
						className='inline-flex h-8 items-center rounded-md bg-foreground px-3 text-xs font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]'
					>
						Apply
					</button>
				</div>
			</div>
		</section>
	);
}

function ScopeButton({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type='button'
			role='tab'
			aria-selected={active}
			onClick={onClick}
			className={
				active
					? 'rounded-md bg-amber-100 px-3 py-1 font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
					: 'rounded-md px-3 py-1 text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
			}
		>
			{children}
		</button>
	);
}

function PresetButton({
	onClick,
	children,
}: {
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type='button'
			onClick={onClick}
			className='rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
		>
			{children}
		</button>
	);
}

function toIsoDate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}
