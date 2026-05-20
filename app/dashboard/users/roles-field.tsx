'use client';

import { useState } from 'react';

import { ROLE_LABEL, RoleType } from '@/app/types/role';

const ROLE_VALUES: readonly RoleType[] = [
	RoleType.SUPER_ADMIN,
	RoleType.ADMIN,
	RoleType.SPACE_OWNER,
	RoleType.CUSTOMER,
	RoleType.USER,
];

/**
 * Multi-role chooser. Renders a labelled grid of checkboxes plus a single
 * hidden `roles` input containing a CSV of selected role ids (e.g. "1,3").
 *
 * This keeps the existing `readFormValues` / Zod CSV pipeline intact rather
 * than introducing a second mechanism for handling array fields.
 */
export function RolesField({
	name = 'roles',
	defaultValue = '',
	error,
	hint,
}: {
	name?: string;
	defaultValue?: string;
	error?: string;
	hint?: string;
}) {
	const [selected, setSelected] = useState<Set<RoleType>>(() => {
		const initial = defaultValue
			.split(',')
			.map((s) => Number(s.trim()))
			.filter((n): n is RoleType => n in RoleType);
		return new Set(initial);
	});

	function toggle(role: RoleType) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(role)) next.delete(role);
			else next.add(role);
			return next;
		});
	}

	const csv = Array.from(selected).join(',');

	return (
		<div className='flex flex-col gap-1.5'>
			<span className='text-sm font-medium text-zinc-800 dark:text-zinc-200'>
				Roles
			</span>
			<div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
				{ROLE_VALUES.map((role) => {
					const checked = selected.has(role);
					return (
						<label
							key={role}
							className='flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900'
						>
							<input
								type='checkbox'
								checked={checked}
								onChange={() => toggle(role)}
								className='h-4 w-4 accent-zinc-900 dark:accent-zinc-100'
							/>
							<span>{ROLE_LABEL[role]}</span>
						</label>
					);
				})}
			</div>
			<input type='hidden' name={name} value={csv} />
			{hint ? (
				<p className='text-xs text-zinc-500 dark:text-zinc-400'>{hint}</p>
			) : null}
			{error ? (
				<p className='text-xs text-red-600 dark:text-red-400'>{error}</p>
			) : null}
		</div>
	);
}
