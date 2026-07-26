import { RoleType } from '@/app/types/role';

export interface NavItem {
	label: string;
	href: string;
	/** If set, only users having at least one of these roles see the link. */
	roles?: readonly RoleType[];
}

export const dashboardNav: readonly NavItem[] = [
	{ label: 'Overview', href: '/dashboard' },
	{ label: 'Parkings', href: '/dashboard/parkings' },
	{
		label: 'Cars',
		href: '/dashboard/cars',
		roles: [RoleType.SPACE_OWNER],
	},
	{
		label: 'Reservations',
		href: '/dashboard/reservations',
		roles: [RoleType.SPACE_OWNER],
	},
	{
		label: 'Space owners',
		href: '/dashboard/co-owners',
		roles: [RoleType.SPACE_OWNER],
	},
	{
		label: 'Users',
		href: '/dashboard/users',
		roles: [RoleType.SUPER_ADMIN],
	},
];
