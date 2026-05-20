import { env } from "./env";

/**
 * Static metadata about the app. Infrastructure config (API URL, cookies)
 * lives in `env.ts` / `auth.ts` — keep this file UI-facing only.
 */
export const siteConfig = {
  name: "Smart Parking",
  description: "Smart Parking management dashboard",
  /** Base URL of the Laravel API (no trailing slash). */
  apiUrl: env.LARAVEL_API_URL,
} as const;

export type SiteConfig = typeof siteConfig;
