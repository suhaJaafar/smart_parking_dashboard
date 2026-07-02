'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';

import {
	approveCoOwnerAction,
	rejectCoOwnerAction,
} from '@/app/lib/co-owners/actions';

type Mode = 'approve' | 'reject';

/**
 * Approve / Reject controls for a single co-owner request row.
 *
 * Each action opens a lightweight confirm dialog before posting the bound
 * server action, mirroring the confirm pattern used by `DeleteUserButton` so
 * the privileged surfaces stay visually consistent.
 */
export function RequestActions({
	id,
	name,
	park,
}: {
	id: string;
	name: string;
	park: string | null;
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
					park={park}
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
	park,
	mode,
	onClose,
}: {
	id: string;
	name: string;
	park: string | null;
	mode: Mode;
	onClose: () => void;
}) {
	const isApprove = mode === 'approve';
	const action = isApprove
		? approveCoOwnerAction.bind(null, id)
		: rejectCoOwnerAction.bind(null, id);

	return (
		<div
			role='dialog'
			aria-modal='true'
			aria-labelledby={`coowner-${id}-title`}
			className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4'
			onClick={onClose}
		>
			<div
				className='w-full max-w-sm rounded-xl border border-black/[.08] bg-white p-5 shadow-xl dark:border-white/[.12] dark:bg-zinc-950'
				onClick={(e) => e.stopPropagation()}
			>
				<h2 id={`coowner-${id}-title`} className='text-sm font-semibold'>
					{isApprove ? 'Approve request?' : 'Reject request?'}
				</h2>
				<p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
					{isApprove ? (
						<>
							<strong>{name}</strong> will be able to fully manage
							{park ? (
								<>
									{' '}
									<strong>{park}</strong>
								</>
							) : (
								' your garage'
							)}{' '}
							from Telegram. They&apos;ll receive a confirmation message right
							away.
						</>
					) : (
						<>
							This declines <strong>{name}</strong>&apos;s request
							{park ? (
								<>
									{' '}
									for <strong>{park}</strong>
								</>
							) : null}
							. They&apos;ll be notified politely on Telegram.
						</>
					)}
				</p>
				<form
					action={action}
					className='mt-4 flex items-center justify-end gap-2'
				>
					<button
						type='button'
						onClick={onClose}
						className='rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
					>
						Cancel
					</button>
					<SubmitButton isApprove={isApprove} />
				</form>
			</div>
		</div>
	);
}

function SubmitButton({ isApprove }: { isApprove: boolean }) {
	const { pending } = useFormStatus();
	const base =
		'rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60';
	const tone = isApprove
		? 'bg-emerald-600 hover:bg-emerald-700'
		: 'bg-red-600 hover:bg-red-700';

	return (
		<button type='submit' disabled={pending} className={`${base} ${tone}`}>
			{pending
				? isApprove
					? 'Approving…'
					: 'Rejecting…'
				: isApprove
					? 'Approve'
					: 'Reject'}
		</button>
	);
}
