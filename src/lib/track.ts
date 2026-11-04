/**
 * Custom events for Vercel Web Analytics (cookieless; see the privacy policy). Safe to call
 * anywhere: when analytics isn't loaded (local development, or not yet enabled in Vercel)
 * the queue simply holds the calls. Keep `data` free of personal information.
 */
type VaFn = (event: "event", payload: { name: string; data?: Record<string, string | number> }) => void;

export function track(name: string, data?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  (window as unknown as { va?: VaFn }).va?.("event", { name, data });
}
