import type { RoleType } from './role';
import type { State } from './state';

/**
 * Shape of `GET /api/admin/stats`. Aggregated, read-only platform metrics
 * powering the admin dashboard. Keep this in sync with `AdminController::stats`.
 */

export interface DashboardTotals {
	parks: number;
	users: number;
	capacity: number;
	free_spaces: number;
	occupied: number;
	/** 0–100. */
	occupancy_pct: number;
}

export interface UsersByRole {
	role: RoleType;
	label: string;
	count: number;
}

export interface ParksByState {
	state: State;
	label: string;
	count: number;
}

export interface RecentPark {
	id: string;
	name: string;
	capacity: number;
	free_spaces: number;
	city: string | null;
	state: string | null;
	owner: {
		id: string;
		name: string;
		email: string;
	} | null;
	created_at: string | null;
}

export interface DashboardStats {
	totals: DashboardTotals;
	users_by_role: UsersByRole[];
	parks_by_state: ParksByState[];
	recent_parks: RecentPark[];
}

/* -------------------------------------------------------------------------- */
/*  Owner (per-user) dashboard                                                */
/* -------------------------------------------------------------------------- */

/**
 * Shape of `GET /api/owner/stats`. Scoped to the authenticated space owner's
 * own portfolio. Keep this in sync with `OwnerStatsService::dashboard`.
 */

export interface OwnerTotals {
	parks: number;
	capacity: number;
	free_spaces: number;
	occupied: number;
	/** 0–100. */
	occupancy_pct: number;
	/** Distinct car owners currently inside the owner's parks. */
	active_customers: number;
	/** Distinct users who have ever reserved one of the owner's parks. */
	total_customers: number;
	/** Reservations currently in START / ACTIVE status. */
	active_reserves: number;
}

export interface OwnerParkRow {
	id: string;
	name: string;
	capacity: number;
	free_spaces: number;
	occupied: number;
	cars_count: number;
	city: string | null;
	state: string | null;
	created_at: string | null;
}

export interface OwnerStats {
	totals: OwnerTotals;
	parks: OwnerParkRow[];
	parks_by_state: ParksByState[];
}
