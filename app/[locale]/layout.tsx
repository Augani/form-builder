import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";
import { setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/sonner";
import { LanguageSwitcher } from "@/components/language-switcher";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: { locale: LocaleType };
};
type LocaleType = (typeof locales)[number];

export default async function LocaleLayout({
  children,
  params,
}: Readonly<Props>) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  setRequestLocale(locale);

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error(error);
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="fixed top-4 right-4 z-50">
            <LanguageSwitcher />
          </div>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
