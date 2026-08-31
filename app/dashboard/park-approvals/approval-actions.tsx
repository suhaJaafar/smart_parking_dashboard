'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

import {
	approveParkAction,
	rejectParkAction,
} from '@/app/lib/park-approvals/actions';

type Mode = 'approve' | 'reject';

/**
 * Approve / Reject controls for a single garage awaiting review.
 *
 * Both go through a confirm dialog rather than firing on the first click:
 * approving grants a role and makes a garage publicly bookable, and rejecting
 * sends the owner a message — neither should be one mis-tap away.
 */
export function ApprovalActions({
	id,
	name,
	owner,
}: {
	id: string;
	name: string;
	owner: string | null;
}) {
	const [mode, setMode] = useState<Mode | null>(null);

	return (
		<>
			<div className='flex items-center justify-end gap-2'>
				<button
					type='button'
					onClick={() => setMode('approve')}
					className='rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
				>
					Approve
				</button>
				<button
					type='button'
					onClick={() => setMode('reject')}
					className='rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40'
				>
					Reject
				</button>
			</div>

			{mode ? (
				<ConfirmDialog
					id={id}
					name={name}
					owner={owner}
					mode={mode}
					onClose={() => setMode(null)}
				/>
			) : null}
		</>
	);
}

function ConfirmDialog({
	id,
	name,
	owner,
	mode,
	onClose,
}: {
	id: string;
	name: string;
	owner: string | null;
	mode: Mode;
	onClose: () => void;
}) {
	const isApprove = mode === 'approve';
	const action = isApprove
		? approveParkAction.bind(null, id)
		: rejectParkAction.bind(null, id);

	return (
		<div
			role='dialog'
			aria-modal='true'
			className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4'
		>
			<form
				action={action}
				className='w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950'
			>
				<h2 className='text-base font-semibold'>
					{isApprove ? 'Approve garage' : 'Reject garage'}
				</h2>

				<p className='mt-2 text-sm text-zinc-600 dark:text-zinc-400'>
					{isApprove ? (
						<>
							<span className='font-medium'>{name}</span>
							{owner ? <> (owner: {owner})</> : null} will become visible to
							drivers, and its owner will be granted the space-owner role.
						</>
					) : (
						<>
							<span className='font-medium'>{name}</span> will stay hidden and
							its owner will be notified.
						</>
					)}
				</p>

				{!isApprove ? (
					<label className='mt-4 block'>
						<span className='text-xs font-medium text-zinc-600 dark:text-zinc-400'>
							Reason (optional — sent to the owner)
						</span>
						<textarea
							name='reason'
							rows={3}
							maxLength={500}
							placeholder='e.g. The pin is not inside the garage.'
							className='mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900'
						/>
					</label>
				) : null}

				<div className='mt-5 flex justify-end gap-2'>
					<button
						type='button'
						onClick={onClose}
						className='rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700'
					>
						Cancel
					</button>
					<SubmitButton isApprove={isApprove} />
				</div>
			</form>
		</div>
	);
}

function SubmitButton({ isApprove }: { isApprove: boolean }) {
	const { pending } = useFormStatus();

	return (
		<button
			type='submit'
			disabled={pending}
			className={`rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 ${
				isApprove
					? 'bg-emerald-600 hover:bg-emerald-700'
					: 'bg-red-600 hover:bg-red-700'
			}`}
		>
			{pending ? 'Working…' : isApprove ? 'Approve' : 'Reject'}
		</button>
	);
}
