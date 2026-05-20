import Link from 'next/link';

import { dashboardNav } from '@/app/config/nav';
import { siteConfig } from '@/app/config/site';
import { logoutAction } from '@/app/lib/auth/actions';
import { requireAuth } from '@/app/lib/auth/dal';
import { hasAnyRole } from '@/app/lib/auth/permissions';

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const user = await requireAuth();

	const visibleNav = dashboardNav.filter(
		(item) => !item.roles || hasAnyRole(user, item.roles),
	);

	return (
		<div className='flex min-h-full flex-1 flex-col'>
			<header className='border-b border-black/[.06] bg-white dark:border-white/[.08] dark:bg-zinc-950'>
				<div className='mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4'>
					<div className='flex items-center gap-8'>
						<Link href='/dashboard' className='text-sm font-semibold'>
							{siteConfig.name}
						</Link>
						<nav className='flex items-center gap-4 text-sm'>
							{visibleNav.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className='text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400'
								>
									{item.label}
								</Link>
							))}
						</nav>
					</div>

					<div className='flex items-center gap-3 text-sm'>
						<span className='hidden text-zinc-600 sm:inline dark:text-zinc-400'>
							{user.name}
						</span>
						<form action={logoutAction}>
							<button
								type='submit'
								className='inline-flex h-9 items-center rounded-md border border-zinc-300 px-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900'
							>
								Sign out
							</button>
						</form>
					</div>
				</div>
			</header>

			<main className='mx-auto w-full max-w-6xl flex-1 px-6 py-8'>
				{children}
			</main>
		</div>
	);
}
