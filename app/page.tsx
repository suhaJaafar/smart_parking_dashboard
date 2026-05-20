import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/app/lib/auth/dal';

export default async function Home() {
	const user = await getCurrentUser();
	redirect(user ? '/dashboard' : '/auth/login');
}
