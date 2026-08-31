import { getCurrentUser } from '@/app/lib/auth/dal';
import { getOwnerStats } from '@/app/lib/owner/api';
import { isAdmin, isSpaceOwner } from '@/app/lib/auth/permissions';
import type { OwnerStats } from '@/app/types/stats';
import type { User } from '@/app/types/user';

import { OccupancyRing } from './components/occupancy-ring';
import { ActionCard } from './components/action-card';
import { StatTile } from './components/stat-tile';
import { SettingsButton } from './components/settings-button';

/**
 * Mini App home.
 *
 * One entry point, two faces — driven entirely by the roles Laravel returns.
 * Roles are exclusive (the bot's `roles()->sync()` guarantees it), so an account
 * is either a garage owner or a driver, never both. Switching between them
 * lives in Settings, mirroring the bot's "تسجيل — تغيير الدور" menu option,
 * so a plain driver is never shown owner controls.
 */
export default async function MiniAppHomePage() {
	const user = await getCurrentUser();

	// The gate only renders children once a session exists, so a null user here
	// means the cookie was accepted but `/api/user` disagreed — treat as guest.
	if (!user) return <GuestFallback />;

	return isSpaceOwner(user) || isAdmin(user) ? (
		<OwnerHome user={user} />
	) : (
		<CustomerHome user={user} />
	);
}

/* ------------------------------- Shared --------------------------------- */

function Greeting({ user, subtitle }: { user: User; subtitle: string }) {
	const firstName = user.name.trim().split(/\s+/)[0] || user.name;
	const initial = firstName.charAt(0).toUpperCase();

	return (
		<header className='sp-animate-in flex items-center gap-3.5 px-5 pt-6'>
			<div
				className='flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold'
				style={{
					background: 'var(--sp-accent)',
					color: 'var(--sp-accent-text)',
				}}
				aria-hidden='true'
			>
				{initial}
			</div>
			<div className='min-w-0 flex-1'>
				<p className='truncate text-lg font-semibold leading-tight'>
					أهلاً، {firstName}
				</p>
				<p className='truncate text-sm' style={{ color: 'var(--sp-muted)' }}>
					{subtitle}
				</p>
			</div>

			<SettingsButton />
		</header>
	);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<h2
			className='px-5 pb-2.5 pt-7 text-xs font-semibold'
			style={{ color: 'var(--sp-muted)' }}
		>
			{children}
		</h2>
	);
}

/* ------------------------------ Owner home ------------------------------ */

async function OwnerHome({ user }: { user: User }) {
	const res = await getOwnerStats();
	const stats: OwnerStats | null = res.ok ? res.data.data : null;
	const totals = stats?.totals;

	return (
		<main className='pb-10'>
			<Greeting user={user} subtitle='هذه حالة مواقفك الآن' />

			<div className='px-5 pt-6'>
				<div className='sp-card sp-animate-scale flex items-center gap-5 p-5'>
					<OccupancyRing value={totals?.occupancy_pct ?? 0} />
					<div className='min-w-0'>
						<p className='text-sm' style={{ color: 'var(--sp-muted)' }}>
							نسبة الإشغال
						</p>
						<p className='mt-0.5 text-2xl font-bold leading-none'>
							{totals ? `${Math.round(totals.occupancy_pct)}%` : '—'}
						</p>
						<p className='mt-1.5 text-sm' style={{ color: 'var(--sp-muted)' }}>
							{totals
								? `${totals.occupied} من ${totals.capacity} مشغولة`
								: 'تعذّر جلب الإحصائيات الآن'}
						</p>
					</div>
				</div>
			</div>

			<SectionTitle>نظرة سريعة</SectionTitle>
			<div className='sp-stagger grid grid-cols-2 gap-3 px-5'>
				<StatTile
					label='أماكن متاحة'
					value={totals ? String(totals.free_spaces) : '—'}
					tone='positive'
				/>
				<StatTile
					label='حجوزات فعّالة'
					value={totals ? String(totals.active_reserves) : '—'}
					tone='accent'
				/>
				<StatTile
					label='عدد المواقف'
					value={totals ? String(totals.parks) : '—'}
				/>
				<StatTile
					label='سيارات بالداخل'
					value={totals ? String(totals.active_customers) : '—'}
				/>
			</div>

			<SectionTitle>الإدارة</SectionTitle>
			<div className='sp-stagger space-y-3 px-5'>
				<ActionCard
					href='/miniapp/reservations'
					title='الحجوزات'
					description='إدخال السيارات الواصلة وإنهاء الحجوزات'
					icon='ticket'
				/>
				<ActionCard
					href='/miniapp/garages'
					title='مواقفي'
					description='السعة والسعر والأماكن المتاحة'
					icon='building'
				/>
			</div>
		</main>
	);
}

/* ---------------------------- Customer home ----------------------------- */

function CustomerHome({ user }: { user: User }) {
	return (
		<main className='pb-10'>
			<Greeting user={user} subtitle='اعثر على موقف قريب خلال ثوانٍ' />

			<div className='px-5 pt-6'>
				<ActionCard
					href='/miniapp/nearby'
					title='أقرب موقف لي'
					description='شاهد الأماكن المتاحة والأسعار حولك'
					icon='pin'
					emphasis
				/>
			</div>

			<SectionTitle>حجوزاتي</SectionTitle>
			<div className='sp-stagger space-y-3 px-5'>
				<ActionCard
					href='/miniapp/booking'
					title='حجزي الحالي'
					description='رمز الحجز والوقت المتبقي للوصول'
					icon='ticket'
				/>
				<ActionCard
					href='/miniapp/history'
					title='السجل'
					description='حجوزاتك ومدفوعاتك السابقة'
					icon='clock'
				/>
			</div>
		</main>
	);
}

/* ------------------------------- Fallback ------------------------------- */

function GuestFallback() {
	return (
		<main className='flex min-h-dvh flex-col items-center justify-center px-8 text-center'>
			<h1 className='sp-animate-in text-lg font-semibold'>
				حسابك غير مكتمل بعد
			</h1>
			<p
				className='sp-animate-in mt-2 max-w-xs text-sm leading-relaxed'
				style={{ color: 'var(--sp-muted)', animationDelay: '80ms' }}
			>
				أرسل <span className='font-semibold'>ابدأ</span> إلى البوت لإكمال
				التسجيل، ثم افتح التطبيق من جديد.
			</p>
		</main>
	);
}
