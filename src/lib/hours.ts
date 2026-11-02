import type { Locale } from "@/i18n/config";
import type { Store } from "./content/types";

export const storeTimeZone = (s: Pick<Store, "province">) => (s.province === "AB" ? "America/Edmonton" : "America/Vancouver");

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Punjabi tells the time by part of day rather than AM/PM: ਸਵੇਰੇ / ਦੁਪਹਿਰ / ਸ਼ਾਮ / ਰਾਤ. */
const punjabiPeriod = (h: number) => (h >= 5 && h < 12 ? "ਸਵੇਰੇ" : h >= 12 && h < 16 ? "ਦੁਪਹਿਰ" : h >= 16 && h < 19 ? "ਸ਼ਾਮ" : "ਰਾਤ");

/** "09:00" → "9 AM" / "ਸਵੇਰੇ 9 ਵਜੇ"; "20:30" → "8:30 PM" / "ਰਾਤ 8:30 ਵਜੇ". */
export function formatTime(hhmm: string, lang: Locale = "en") {
  const [h, m] = hhmm.split(":").map(Number);
  const hour = h % 12 || 12;
  const clock = `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
  return lang === "pa" ? `${punjabiPeriod(h)} ${clock} ਵਜੇ` : `${clock} ${h >= 12 ? "PM" : "AM"}`;
}

/** "9 AM - 9 PM" / "ਸਵੇਰੇ 9 ਵਜੇ ਤੋਂ ਰਾਤ 9 ਵਜੇ ਤੱਕ" */
export const formatHours = (s: Pick<Store, "opens" | "closes">, lang: Locale = "en") =>
  lang === "pa" ? `${formatTime(s.opens, "pa")} ਤੋਂ ${formatTime(s.closes, "pa")} ਤੱਕ` : `${formatTime(s.opens)} - ${formatTime(s.closes)}`;

export type OpenState = { open: boolean; label: string; soon: boolean };

/** Open/closed right now in the store's own time zone (BC and Alberta differ by an hour). */
export function openState(s: Pick<Store, "opens" | "closes" | "province">, now = new Date(), lang: Locale = "en"): OpenState {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: storeTimeZone(s), hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const minutes = Number(parts.find((p) => p.type === "hour")!.value) * 60 + Number(parts.find((p) => p.type === "minute")!.value);
  const opens = toMinutes(s.opens);
  const closes = toMinutes(s.closes);
  if (minutes >= opens && minutes < closes) {
    const soon = closes - minutes <= 60;
    const closesAt = formatTime(s.closes, lang);
    if (lang === "pa") return { open: true, soon, label: soon ? `ਜਲਦੀ ਬੰਦ ਹੋਵੇਗਾ · ${closesAt}` : `${closesAt} ਤੱਕ ਖੁੱਲ੍ਹਾ` };
    return { open: true, soon, label: soon ? `Closes soon · ${closesAt}` : `Open until ${closesAt}` };
  }
  const soon = minutes < opens && opens - minutes <= 60;
  const at = formatTime(s.opens, lang);
  if (lang === "pa") return { open: false, soon, label: minutes < opens ? `${at} ਖੁੱਲ੍ਹੇਗਾ` : `ਕੱਲ੍ਹ ${at} ਖੁੱਲ੍ਹੇਗਾ` };
  return { open: false, soon, label: minutes < opens ? `Opens ${at}` : `Opens tomorrow ${at}` };
}

/** schema.org openingHoursSpecification, same hours every day. */
export const openingHoursSpec = (s: Pick<Store, "opens" | "closes">) => ({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  opens: s.opens,
  closes: s.closes,
});
