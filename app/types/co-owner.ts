/**
 * Co-owner request types — mirrors Laravel's `CoOwnerRequestResource`.
 *
 * A co-owner request is raised from the Telegram bot by someone who wants to
 * help manage a specific garage. The garage owner reviews the request in the
 * dashboard and either approves (linking the requester's Telegram chat to the
 * owner's account) or rejects it.
 */

/** Lifecycle status of a co-owner request. */
export type CoOwnerRequestStatus = 'pending' | 'approved' | 'rejected';

/** Slim garage reference embedded in a request (`park.whenLoaded`). */
export interface CoOwnerRequestPark {
	id: string;
	name: string;
}

/** Co-owner request entity as returned by the API. */
export interface CoOwnerRequest {
	id: string;
	requester_name: string;
	requester_phone: string;
	/** Origin channel — currently always `telegram`. */
	channel: string;
	status: CoOwnerRequestStatus;
	/** Present when the backend eager-loads the target garage. */
	park?: CoOwnerRequestPark | null;
	/** ISO-8601 timestamp of when the request was submitted. */
	created_at?: string | null;
	/** ISO-8601 timestamp of when the owner decided, if any. */
	decided_at?: string | null;
}
