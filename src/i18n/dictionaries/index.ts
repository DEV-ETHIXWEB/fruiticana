import type { Locale } from "../config";
import { en } from "./en";
import { pa } from "./pa";
import type { Widen } from "./types";

export type Dictionary = Widen<typeof en>;

const dictionaries: Record<Locale, Dictionary> = { en, pa };

export const getDictionary = (lang: Locale): Dictionary => dictionaries[lang];
