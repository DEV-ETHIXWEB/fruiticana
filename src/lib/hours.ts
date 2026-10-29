import type { Store } from "./content/types";

export const storeTimeZone = (s: Pick<Store, "province">) => (s.province === "AB" ? "America/Edmonton" : "America/Vancouver");

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** "09:00" → "9 AM", "08:30" → "8:30 AM" */
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""} ${suffix}`;
}

export const formatHours = (s: Pick<Store, "opens" | "closes">) => `${formatTime(s.opens)} - ${formatTime(s.closes)}`;

export type OpenState = { open: boolean; label: string; soon: boolean };

/** Open/closed right now in the store's own time zone (BC and Alberta differ by an hour). */
export function openState(s: Pick<Store, "opens" | "closes" | "province">, now = new Date()): OpenState {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: storeTimeZone(s), hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const minutes = Number(parts.find((p) => p.type === "hour")!.value) * 60 + Number(parts.find((p) => p.type === "minute")!.value);
  const opens = toMinutes(s.opens);
  const closes = toMinutes(s.closes);
  if (minutes >= opens && minutes < closes) {
    const soon = closes - minutes <= 60;
    return { open: true, soon, label: soon ? `Closes soon · ${formatTime(s.closes)}` : `Open until ${formatTime(s.closes)}` };
  }
  const soon = minutes < opens && opens - minutes <= 60;
  return { open: false, soon, label: minutes < opens ? `Opens ${formatTime(s.opens)}` : `Opens tomorrow ${formatTime(s.opens)}` };
}

/** schema.org openingHoursSpecification, same hours every day. */
export const openingHoursSpec = (s: Pick<Store, "opens" | "closes">) => ({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  opens: s.opens,
  closes: s.closes,
});
