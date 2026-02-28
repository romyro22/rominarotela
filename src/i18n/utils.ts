import { translations } from "./translations";

type SupportedLocale = "es" | "en";

/** Get a translation by key for the given locale. Falls back to Spanish, then to the key itself. */
export function t(locale: string | undefined, key: string): string {
  const lang: SupportedLocale = locale === "en" ? "en" : "es";
  return translations[lang][key] ?? translations.es[key] ?? key;
}

/** Pick the localized value from an ES/EN pair. */
export function localizedField(
  locale: string | undefined,
  esValue: string,
  enValue: string,
): string {
  return locale === "en" && enValue ? enValue : esValue;
}

/** Get the CV download path based on locale. */
export function getCvPath(locale: string | undefined): string {
  return locale === "en" ? "/docs/cv_rominarotela_en.pdf" : "/docs/cv_rominarotela.pdf";
}
