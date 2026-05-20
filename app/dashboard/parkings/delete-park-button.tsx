'use client';

import { useState } from 'react';

import { deleteParkAction } from '@/app/lib/parks/actions';

/**
 * Inline delete button with a lightweight confirm dialog. Uses the standard
 * Server Action via a bound `<form action>` so the request still benefits from
 * `revalidatePath` + `redirect` on the server.
 */
export function DeleteParkButton({ id, name }: { id: string; name: string }) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type='button'
				onClick={() => setOpen(true)}
				className='rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40'
			>
				Delete
			</button>

			{open ? (
				<div
					role='dialog'
					aria-modal='true'
					aria-labelledby={`del-${id}-title`}
					className='fixed inset-0 z-50 grid place-items-center bg-black/40 p-4'
					onClick={() => setOpen(false)}
				>
					<div
						className='w-full max-w-sm rounded-xl border border-black/[.08] bg-white p-5 shadow-xl dark:border-white/[.12] dark:bg-zinc-950'
						onClick={(e) => e.stopPropagation()}
					>
						<h2 id={`del-${id}-title`} className='text-sm font-semibold'>
							Delete parking?
						</h2>
						<p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
							This will permanently delete <strong>{name}</strong>. This action
							cannot be undone.
						</p>
						<div className='mt-4 flex items-center justify-end gap-2'>
							<button
								type='button'
								onClick={() => setOpen(false)}
								className='rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
							>
								Cancel
							</button>
							<form action={deleteParkAction.bind(null, id)}>
								<button
									type='submit'
									className='rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700'
								>
									Delete
								</button>
							</form>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
