import type { en } from "./en";
import type { Widen } from "./types";

/** Punjabi (Gurmukhi) interface text. Must mirror every key in en.ts. */
export const pa: Widen<typeof en> = {
  language: {
    switchTo: "English",
    switchToLabel: "Read in English (ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਪੜ੍ਹੋ)",
    suggest: "ਇਹ ਸਾਈਟ ਪੰਜਾਬੀ ਵਿੱਚ ਵੀ ਉਪਲਬਧ ਹੈ।",
    suggestAction: "ਪੰਜਾਬੀ ਵਿੱਚ ਦੇਖੋ",
    dismiss: "ਬੰਦ ਕਰੋ",
  },
};
