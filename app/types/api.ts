export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

/** Laravel-style validation error body. */
export interface ApiErrorBody {
  message?: string;
  error?: string;
  /** Validation errors keyed by field name. */
  errors?: Record<string, string[]>;
}

/**
 * Discriminated result for HTTP calls.
 *
 *   if (res.ok) use res.data
 *   else        use res.error / res.status
 */
export type ApiResult<T> =
  | { ok: true; status: number; data: T; error: null }
  | { ok: false; status: number; data: null; error: ApiErrorBody | null };
