'use client';

import { useState } from 'react';

import {
	cancelReservationAction,
	exitReservationAction,
} from '@/app/lib/reservations/actions';

/**
 * Two-in-one confirm button used by the reservations list. The mode picks
 * which server action is invoked and whether the confirm styling is a
 * "cancel" (amber) or a destructive "exit" (red) affordance.
 *
 * Neither mode deletes anything — both only flip a status column server-side,
 * mirroring the bot flows.
 */
export function ReservationActionButton({
	id,
	mode,
	bookingCode,
	plate,
	redirectTo,
}: {
	id: string;
	mode: 'cancel' | 'exit';
	bookingCode: string | null;
	plate: string | null;
	redirectTo?: string;
}) {
	const [open, setOpen] = useState(false);

	const isCancel = mode === 'cancel';
	const action = isCancel ? cancelReservationAction : exitReservationAction;
	const label = isCancel ? 'Cancel' : 'Exit car';
	const dialogTitle = isCancel ? 'Cancel reservation?' : 'Confirm car exit?';
	const dialogBody = isCancel
		? 'The customer will be notified that their hold was cancelled. No slot is freed because no car has entered yet.'
		: 'This drives the car out of the garage: the slot is freed and the reservation is marked completed. This mirrors the bot exit exactly.';
	const confirmText = isCancel ? 'Yes, cancel' : 'Yes, exit car';

	const triggerClasses = isCancel
		? 'rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-300 dark:hover:bg-amber-950/40'
		: 'rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40';

	const confirmClasses = isCancel
		? 'rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700'
		: 'rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700';

	const dialogId = `resv-${mode}-${id}-title`;

	return (
		<>
			<button
				type='button'
				onClick={() => setOpen(true)}
				className={triggerClasses}
			>
				{label}
			</button>

			{open ? (
				<div
					role='dialog'
					aria-modal='true'
					aria-labelledby={dialogId}
					className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4'
					onClick={() => setOpen(false)}
				>
					<div
						className='w-full max-w-sm rounded-xl border border-black/[.08] bg-white p-5 shadow-xl dark:border-white/[.12] dark:bg-zinc-950'
						onClick={(e) => e.stopPropagation()}
					>
						<h2 id={dialogId} className='text-sm font-semibold'>
							{dialogTitle}
						</h2>
						<p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
							{dialogBody}
						</p>
						<dl className='mt-3 grid grid-cols-2 gap-2 text-xs'>
							<div>
								<dt className='uppercase tracking-wide text-zinc-500'>Code</dt>
								<dd className='mt-0.5 font-mono font-semibold tracking-widest text-zinc-900 dark:text-zinc-100'>
									{bookingCode ?? '—'}
								</dd>
							</div>
							<div>
								<dt className='uppercase tracking-wide text-zinc-500'>Plate</dt>
								<dd className='mt-0.5 font-mono font-semibold tracking-wider text-zinc-900 dark:text-zinc-100'>
									{plate ?? '—'}
								</dd>
							</div>
						</dl>
						<div className='mt-4 flex items-center justify-end gap-2'>
							<button
								type='button'
								onClick={() => setOpen(false)}
								className='rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
							>
								Keep
							</button>
							<form action={action.bind(null, id)}>
								{redirectTo ? (
									<input type='hidden' name='redirectTo' value={redirectTo} />
								) : null}
								<button type='submit' className={confirmClasses}>
									{confirmText}
								</button>
							</form>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
