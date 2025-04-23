"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const LoginPage = (): React.ReactNode => {
  const t = useTranslations("login");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loginSchema = z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(6, t("passwordTooShort")),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAlert(null);
    try {
      // This would be replaced with actual authentication logic
      console.log("Login data:", data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAlert({
        type: "success",
        message: t("loginSuccess"),
      });
    } catch (error) {
      console.error("Login error:", error);
      setAlert({
        type: "error",
        message: t("loginError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 mx-auto">
            <Image
              src="/logo.svg"
              alt="Snapform"
              width={60}
              height={20}
              className="dark:invert"
            />
          </Link>
          <h1 className="text-3xl font-bold">{t("welcome")}</h1>
          <p className="text-muted-foreground mt-2">{t("enterCredentials")}</p>
        </div>

        {alert && (
          <Alert
            variant={alert.type === "error" ? "destructive" : "default"}
            className="mb-4"
          >
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("login")}</CardTitle>
            <CardDescription>{t("loginDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              noValidate
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t("email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  {...form.register("email")}
                  disabled={isLoading}
                  aria-invalid={!!form.formState.errors.email}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    {t("password")}
                  </label>
                  <Link
                    href="#"
                    className="text-sm text-primary hover:underline"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  disabled={isLoading}
                  aria-invalid={!!form.formState.errors.password}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="login-button"
              >
                {isLoading ? t("signingIn") : t("signIn")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2 border-t p-6">
            <div className="text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link href="#" className="text-primary hover:underline">
                {t("signUp")}
              </Link>
            </div>
            <div className="text-sm text-muted-foreground mx-auto text-center">
              {t("terms")}{" "}
              <Link href="#" className="text-primary hover:underline">
                {t("termsOfService")}
              </Link>{" "}
              {t("and")}{" "}
              <Link href="#" className="text-primary hover:underline">
                {t("privacyPolicy")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
