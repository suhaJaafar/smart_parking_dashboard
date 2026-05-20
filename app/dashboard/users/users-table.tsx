import Link from 'next/link';

import { DeleteUserButton } from '@/app/dashboard/users/delete-user-button';
import { ROLE_LABEL, type RoleType } from '@/app/types/role';
import type { User } from '@/app/types/user';

/**
 * Tabular users view used by the SUPER_ADMIN management page.
 *
 * Owner self-delete is blocked at the button level — the API would also
 * reject it but we render a clearer affordance.
 */
export function UsersTable({
	users,
	currentUserId,
}: {
	users: readonly User[];
	currentUserId: string;
}) {
	return (
		<div className='overflow-x-auto rounded-xl border border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950'>
			<table className='w-full text-sm'>
				<thead className='bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60'>
					<tr>
						<th className='px-4 py-3 font-medium'>Name</th>
						<th className='px-4 py-3 font-medium'>Email</th>
						<th className='px-4 py-3 font-medium'>Phone</th>
						<th className='px-4 py-3 font-medium'>Roles</th>
						<th
							className='px-4 py-3 text-right font-medium'
							aria-label='Actions'
						/>
					</tr>
				</thead>
				<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
					{users.map((u) => (
						<Row key={u.id} user={u} isSelf={u.id === currentUserId} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function Row({ user, isSelf }: { user: User; isSelf: boolean }) {
	return (
		<tr className='hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40'>
			<td className='px-4 py-3'>
				<Link
					href={`/dashboard/users/${user.id}`}
					className='font-medium hover:underline'
				>
					{user.name}
				</Link>
				{isSelf ? (
					<span className='ml-2 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300'>
						You
					</span>
				) : null}
			</td>
			<td className='px-4 py-3 text-zinc-700 dark:text-zinc-300'>
				{user.email}
			</td>
			<td className='px-4 py-3 text-zinc-700 dark:text-zinc-300'>
				{user.phone_number ?? '—'}
			</td>
			<td className='px-4 py-3'>
				<RolesPills roles={user.roles ?? []} />
			</td>
			<td className='px-4 py-3 text-right'>
				<div className='flex items-center justify-end gap-2'>
					<Link
						href={`/dashboard/users/${user.id}`}
						className='rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
					>
						View
					</Link>
					<Link
						href={`/dashboard/users/${user.id}/edit`}
						className='rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900'
					>
						Edit
					</Link>
					<DeleteUserButton
						id={user.id}
						name={user.name}
						disabled={isSelf}
						disabledReason='You cannot delete your own account.'
					/>
				</div>
			</td>
		</tr>
	);
}

function RolesPills({ roles }: { roles: readonly { role: RoleType }[] }) {
	if (roles.length === 0) {
		return <span className='text-xs text-zinc-500'>—</span>;
	}
	return (
		<div className='flex flex-wrap gap-1'>
			{roles.map((r) => (
				<span
					key={r.role}
					className='rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
				>
					{ROLE_LABEL[r.role] ?? r.role}
				</span>
			))}
		</div>
	);
}
