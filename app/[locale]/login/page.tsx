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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type LoginFormValues = {
  email: string;
  password: string;
};

const LoginPage = (): React.ReactNode => {
  const t = useTranslations("login");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const loginSchema = z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(6, t("passwordTooShort")),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      debugger;
      if (result?.error) {
        toast.error(t("loginError"));
      } else {
        toast.success(t("loginSuccess"));
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t("loginError"));
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
              priority
            />
          </Link>
          <h1 className="text-3xl font-bold">{t("welcome")}</h1>
          <p className="text-muted-foreground mt-2">{t("enterCredentials")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("login")}</CardTitle>
            <CardDescription>{t("loginDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                noValidate
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("emailPlaceholder")}
                          type="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{t("password")}</FormLabel>
                        <Link
                          href="#"
                          className="text-sm text-primary hover:underline"
                        >
                          {t("forgotPassword")}
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !form.formState.isValid}
                  data-testid="login-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("signingIn")}
                    </>
                  ) : (
                    t("signIn")
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center space-y-2 border-t p-6">
            <div className="text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link href="/signup" className="text-primary hover:underline">
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
