"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut } from "lucide-react";

export default function LogoutPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Function to handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Auto logout after 3 seconds if user doesn't click the button
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggingOut) {
        handleLogout();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoggingOut]);

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("signing_out")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 text-center">
          <LogOut className="h-16 w-16 text-primary animate-pulse" />
          <p>{t("logout_confirmation")}</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handleLogout}
            className="w-full"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? t("signing_out_process") : t("sign_out_now")}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/dashboard")}
            disabled={isLoggingOut}
          >
            {t("cancel")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
