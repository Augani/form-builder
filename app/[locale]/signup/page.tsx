"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import apiClient from "@/lib/axios";

export default function SignupPage() {
  const t = useTranslations("signup");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Create validation schema with translated messages
  const signupSchema = z
    .object({
      name: z.string().min(2, t("error.nameTooShort")).optional(),
      email: z.string().email(t("error.invalidEmail")),
      password: z.string().min(8, t("error.passwordTooShort")),
      confirmPassword: z.string().min(8, t("error.passwordTooShort")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("error.passwordsDontMatch"),
      path: ["confirmPassword"],
    });

  type SignupFormValues = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);

    try {
      const response = await apiClient.post("/api/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (response.status !== 201) {
        throw new Error(t("error.general"));
      }

      toast.success(t("success"));
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error.general"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center mx-auto">
      <div className="md:mx-auto flex flex-col justify-center space-y-6 w-[350px]">
        <Link href="/" className="flex justify-center">
          <Image
            src="/logo.svg"
            alt="Snapform"
            className="dark:invert"
            width={60}
            height={20}
            priority
          />
        </Link>
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("namePlaceholder")}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {...field}
                      disabled={isLoading}
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
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("passwordPlaceholder")}
                      type="password"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("confirmPasswordPlaceholder")}
                      type="password"
                      {...field}
                      disabled={isLoading}
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
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("creatingAccount")}
                </>
              ) : (
                t("signUp")
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          {t("alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
