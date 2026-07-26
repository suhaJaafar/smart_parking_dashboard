/**
 * Single source of truth for backend (Laravel) endpoint paths.
 *
 * Use `endpoints.x.y()` or `endpoints.x.y` so refactors stay typed and there
 * are no magic strings sprinkled across the codebase.
 */
export const endpoints = {
	auth: {
		login: '/api/login',
		register: '/api/register',
		logout: '/api/logout',
		me: '/api/user',
		whatsappRequestCode: '/api/auth/whatsapp/request-code',
		whatsappVerifyCode: '/api/auth/whatsapp/verify-code',
		telegramVerifyCode: '/api/auth/telegram/verify-code',
	},
	users: {
		list: '/api/users',
		detail: (id: string | number) => `/api/users/${id}`,
	},
	parks: {
		list: '/api/parks',
		create: '/api/parks',
		detail: (id: string | number) => `/api/parks/${id}`,
		update: (id: string | number) => `/api/parks/${id}`,
		remove: (id: string | number) => `/api/parks/${id}`,
		mine: '/api/parks/user',
		enterCar: (id: string | number) => `/api/parks/${id}/entercar`,
		exitCar: (id: string | number) => `/api/parks/${id}/exitcar`,
	},
	customer: {
		nearbyParks: '/api/customer/parks/nearby',
	},
	admin: {
		stats: '/api/admin/stats',
		reservationStats: '/api/admin/reservation-stats',
	},
	owner: {
		stats: '/api/owner/stats',
		reservationStats: '/api/owner/reservation-stats',
		coOwnerRequests: '/api/owner/co-owner-requests',
		approveCoOwnerRequest: (id: string | number) =>
			`/api/owner/co-owner-requests/${id}/approve`,
		rejectCoOwnerRequest: (id: string | number) =>
			`/api/owner/co-owner-requests/${id}/reject`,
		cars: {
			list: '/api/owner/cars',
			create: '/api/owner/cars',
			detail: (id: string | number) => `/api/owner/cars/${id}`,
			update: (id: string | number) => `/api/owner/cars/${id}`,
			remove: (id: string | number) => `/api/owner/cars/${id}`,
		},
		reservations: {
			list: '/api/owner/reservations',
			detail: (id: string | number) => `/api/owner/reservations/${id}`,
			cancel: (id: string | number) => `/api/owner/reservations/${id}/cancel`,
			exit: (id: string | number) => `/api/owner/reservations/${id}/exit`,
		},
	},
} as const;

export type Endpoints = typeof endpoints;
