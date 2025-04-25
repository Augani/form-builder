"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.navigation");

  const navItems = [
    {
      name: t("dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("forms"),
      href: "/dashboard/forms",
      icon: FileText,
    },
    {
      name: t("newForm"),
      href: "/dashboard/forms/new",
      icon: PlusCircle,
      highlight: true,
    },
    {
      name: t("profile"),
      href: "/dashboard/profile",
      icon: User,
    },
  ];

  const mobileNavItems = [
    ...navItems.slice(0, 4),
    {
      name: t("logout"),
      href: "/logout",
      icon: LogOut,
    },
  ];

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-20 flex-shrink-0 border-r bg-background hidden md:flex md:flex-col">
        <div className="flex h-16 items-center justify-center border-b">
          <Link href="/dashboard">
            <Image
              src="/logo.svg"
              alt="Snapform"
              width={36}
              height={36}
              className="dark:invert"
              priority
            />
          </Link>
        </div>
        <div className="flex flex-col items-center gap-4 p-4 flex-1">
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-md",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : item.highlight
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.name}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        <div className="border-t p-4">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/logout" className="text-muted-foreground">
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">{t("logout")}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("logout")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t flex items-center justify-around px-4">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon
              className={cn(
                "h-6 w-6",
                item.highlight && pathname !== item.href && "text-primary"
              )}
            />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
