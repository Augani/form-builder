import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/i18n";

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // Using always to avoid redirect loops
  localePrefix: "always",
  // Add default locale to path when current locale is the default locale
  // This ensures paths like /en/login will work correctly
  localeDetection: true,
});

export const config = {
  // Match all pathnames except for
  // - API routes, next.js specific files, directly accessible files (public folder)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
