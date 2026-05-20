import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/app/lib/auth/dal';

export default async function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// If the user is already signed in, bounce to the dashboard.
	const user = await getCurrentUser();
	if (user) redirect('/dashboard');

	return (
		<main className='flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black'>
			<div className='w-full max-w-md rounded-2xl border border-black/[.06] bg-white p-8 shadow-sm dark:border-white/[.08] dark:bg-zinc-950'>
				{children}
			</div>
		</main>
	);
}
