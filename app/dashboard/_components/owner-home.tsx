import Link from 'next/link';
import type { ReactNode } from 'react';

import { isAdmin, isSuperAdmin } from '@/app/lib/auth/permissions';
import type { User } from '@/app/types/user';

/**
 * Default landing page for space-owners / customers / unrecognised users.
 * Shows quick links plus a banner if backend roles weren't loaded.
 */
export function OwnerHome({ user }: { user: User }) {
	const showAdminTools = isAdmin(user);
	const showUserManagement = isSuperAdmin(user);
	const hasRoles = (user.roles?.length ?? 0) > 0;

	return (
		<div className='space-y-6'>
			<header>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Welcome, {user.name}
				</h1>
				<p className='text-sm text-zinc-600 dark:text-zinc-400'>
					You are signed in as {user.email}.
				</p>
			</header>

			<section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				<HomeCard title='Your parkings' href='/dashboard/parkings'>
					Browse and manage your parking spaces.
				</HomeCard>

				{showAdminTools ? (
					<HomeCard title='Admin tools' href='/dashboard'>
						Moderate parkings and reservations across the platform.
					</HomeCard>
				) : null}

				{showUserManagement ? (
					<HomeCard title='Users' href='/dashboard'>
						Manage user accounts and roles.
					</HomeCard>
				) : null}
			</section>

			{!hasRoles ? <MissingRolesNotice /> : null}
		</div>
	);
}

function HomeCard({
	title,
	href,
	children,
}: {
	title: string;
	href: string;
	children: ReactNode;
}) {
	return (
		<Link
			href={href}
			className='block rounded-xl border border-black/[.06] bg-white p-5 shadow-sm transition-colors hover:border-black/[.12] dark:border-white/[.08] dark:bg-zinc-950 dark:hover:border-white/[.16]'
		>
			<h3 className='text-sm font-semibold'>{title}</h3>
			<p className='mt-1 text-sm text-zinc-600 dark:text-zinc-400'>
				{children}
			</p>
		</Link>
	);
}

function MissingRolesNotice() {
	return (
		<p className='rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'>
			Role-based features are hidden because the <code>/api/user</code> endpoint
			did not include a <code>roles</code> array. Add{' '}
			<code>-&gt;load(&apos;roles&apos;)</code> to{' '}
			<code>AuthController::user()</code>.
		</p>
	);
}
