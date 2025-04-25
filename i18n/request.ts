import { getRequestConfig } from "next-intl/server";
import { locales, defaultLocale } from "@/i18n";

type LocaleType = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  const safeLocale =
    locale && locales.includes(locale as LocaleType) ? locale : defaultLocale;

  return {
    locale: safeLocale,
    messages: (await import(`@/messages/${safeLocale}.json`)).default,
  };
});
