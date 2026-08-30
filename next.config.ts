import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/**
	 * Origins allowed to request dev-server internals (`/_next/*`, HMR).
	 *
	 * Next blocks cross-origin dev requests by default, which silently prevents
	 * hydration when the app is reached through a tunnel: the page server-renders
	 * but the client bundle never boots. Telegram Mini Apps can only be opened
	 * over HTTPS, so tunnelling is unavoidable in development.
	 *
	 * Dev-only — this has no effect on a production build.
	 */
	allowedDevOrigins: ['*.trycloudflare.com', '*.ngrok-free.dev', '*.ngrok.app'],
};

export default nextConfig;
