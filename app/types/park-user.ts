import type { Paginated } from '@/app/types/pagination';

/**
 * A customer who has reserved at one of the owner's garages, with their
 * lifetime activity aggregates. Shape of each row in
 * `GET /api/owner/park-users` (backed by `ParkUserResource`).
 *
 * This is person-centric: one entry per distinct user, counting every
 * reservation they ever made at the owner's parks — regardless of how it
 * ended (completed, cancelled, expired, still waiting, or currently active).
 */
export interface ParkUser {
	user_id: string;
	name: string | null;
	phone_number: string | null;
	/** The customer's most recent car, if known. */
	car: {
		id: string;
		plate: string;
		model: string | null;
	} | null;
	/** Total reservations this customer made at the owner's parks. */
	total: number;
	completed: number;
	active: number;
	waiting: number;
	cancelled: number;
	expired: number;
	/** ISO timestamp of their first reservation in scope. */
	first_at: string | null;
	/** ISO timestamp of their most recent reservation in scope. */
	last_at: string | null;
}

/**
 * The `GET /api/owner/park-users` response — a standard Laravel resource
 * collection (`{ data, links, meta }`), like every other owner list.
 */
export type ParkUsersPage = Paginated<ParkUser>;
