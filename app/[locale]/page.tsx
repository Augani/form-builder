"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

const Home = (): React.ReactNode => {
  const t = useTranslations("home");
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(var(--primary),0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[gradient_15s_ease_infinite]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.15)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(var(--primary),0.05)_50%,transparent_100%)] bg-[length:100%_100%]" />

        <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(var(--primary),0.05)_50%,transparent_100%)] bg-[length:100%_100%]" />
      </div>

      <div className="container mx-auto px-4 pt-16 lg:pt-24 relative z-10">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Snapform Logo"
              width={100}
              height={100}
              priority
              className="dark:invert"
            />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t("createForms")}{" "}
            <span className="text-primary">{t("effortlessly")}</span>
          </h1>

          <p className="max-w-[600px] text-lg text-muted-foreground">
            {t("buildForms")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                {t("loginToDashboard")}
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t("signUp")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t("whyChoose")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("easyToUse")}</CardTitle>
              <CardDescription>{t("easyToUseDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h10" />
                  <path d="M7 12h10" />
                  <path d="M7 17h10" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("customizable")}</CardTitle>
              <CardDescription>{t("customizableDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2v2" />
                  <path d="M12 22v-2" />
                  <path d="m17 20.66-1-1.73" />
                  <path d="M11 10.27 7 3.34" />
                  <path d="m20.66 17-1.73-1" />
                  <path d="m3.34 7 1.73 1" />
                  <path d="M14 12h8" />
                  <path d="M2 12h2" />
                  <path d="m20.66 7-1.73 1" />
                  <path d="m3.34 17 1.73-1" />
                  <path d="m17 3.34-1 1.73" />
                  <path d="m7 20.66 1-1.73" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("responsive")}</CardTitle>
              <CardDescription>{t("responsiveDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <path d="M12 18h.01" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Multiple Field Types</CardTitle>
              <CardDescription>
                Choose from text, email, number, textarea, select, radio,
                checkbox, and date fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" />
                  <path d="M15 18h-5" />
                  <path d="M10 6h8v4h-8V6Z" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Analytics</CardTitle>
              <CardDescription>
                Track responses, completion rates, and user engagement with
                detailed analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>
                Your data is protected with industry-standard security measures
                and encryption.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("dragAndDrop")}</CardTitle>
              <CardDescription>{t("dragAndDropDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M5 3v4" />
                  <path d="M3 5h4" />
                  <path d="M11 3v4" />
                  <path d="M9 5h4" />
                  <path d="M5 11v4" />
                  <path d="M3 9h4" />
                  <path d="M11 11v4" />
                  <path d="M9 9h4" />
                  <path d="M17 3v4" />
                  <path d="M15 5h4" />
                  <path d="M17 11v4" />
                  <path d="M15 9h4" />
                  <path d="M5 17v4" />
                  <path d="M3 15h4" />
                  <path d="M11 17v4" />
                  <path d="M9 15h4" />
                  <path d="M17 17v4" />
                  <path d="M15 15h4" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("livePreview")}</CardTitle>
              <CardDescription>{t("livePreviewDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h10" />
                  <path d="M7 12h10" />
                  <path d="M7 17h10" />
                  <path d="M3 3v18h18" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("customThemes")}</CardTitle>
              <CardDescription>{t("customThemesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-primary/10 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{t("readyToStart")}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t("joinUsers")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">{t("signUp")}</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                {t("loginToDashboard")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-card/50 backdrop-blur-sm py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <h1 className="text-2xl font-bold">Snapform</h1>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
