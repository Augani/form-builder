"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, User, Shield, Bell, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const t = useTranslations("dashboard.profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsFetching(true);
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to load user profile");
        toast.error(t("errorFetchingProfile"));
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserProfile();
  }, [t]);

  const profileSchema = z.object({
    name: z.string().min(2, t("nameRequired")),
    email: z.string().email(t("invalidEmail")),
  });

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onChange",
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email,
      });
    }
  }, [user, form]);

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(8, t("passwordTooShort")),
      newPassword: z.string().min(8, t("passwordTooShort")),
      confirmPassword: z.string().min(8, t("passwordTooShort")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    });

  type PasswordFormValues = z.infer<typeof passwordSchema>;

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const responseData = await response.json();
      setUser(responseData.user);
      toast.success(t("profileUpdated"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("errorUpdatingProfile"));
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update password");
      }

      toast.success(t("passwordChanged"));
      passwordForm.reset();
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(t("errorChangingPassword"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h1 className="text-xl font-medium mb-2">{error}</h1>
          <Button onClick={() => window.location.reload()}>
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">{t("profileSettings")}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader className="flex flex-col items-center p-4 md:p-6">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="text-3xl md:text-4xl">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-lg md:text-xl">
                {user?.name}
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("role")}</span>
                  <span className="font-medium">{user?.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("memberSince")}
                  </span>
                  <span className="font-medium">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-3/4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
              <TabsTrigger value="general" className="text-xs md:text-sm">
                <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                {t("generalSettings")}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs md:text-sm">
                <Bell className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                {t("notifications")}
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs md:text-sm">
                <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                {t("security")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>{t("generalSettings")}</CardTitle>
                  <CardDescription>
                    {t("generalSettingsDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onProfileSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm md:text-base">
                              {t("name")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isLoading}
                                className="text-sm md:text-base"
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
                            <FormLabel className="text-sm md:text-base">
                              {t("email")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                {...field}
                                disabled={isLoading}
                                className="text-sm md:text-base"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading || !form.formState.isDirty}
                        className="w-full md:w-auto"
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        {t("saveChanges")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>{t("notificationSettings")}</CardTitle>
                  <CardDescription>
                    {t("notificationSettingsDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">
                          {t("emailNotifications")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("emailNotificationsDescription")}
                        </p>
                      </div>
                      <Switch defaultChecked={true} id="email-notifications" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">
                          {t("formSubmissions")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("formSubmissionsDescription")}
                        </p>
                      </div>
                      <Switch defaultChecked={true} id="form-submissions" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="text-base font-medium">
                          {t("marketingEmails")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("marketingEmailsDescription")}
                        </p>
                      </div>
                      <Switch defaultChecked={false} id="marketing-emails" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    {t("saveNotificationSettings")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>{t("changePassword")}</CardTitle>
                  <CardDescription>
                    {t("changePasswordDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("currentPassword")}</FormLabel>
                            <FormControl>
                              <Input
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
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("newPassword")}</FormLabel>
                            <FormControl>
                              <Input
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
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("confirmPassword")}</FormLabel>
                            <FormControl>
                              <Input
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
                        disabled={isLoading || !passwordForm.formState.isDirty}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        {t("changePassword")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{t("twoFactorAuth")}</CardTitle>
                  <CardDescription>
                    {t("twoFactorAuthDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-medium">
                        {t("enableTwoFactor")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("enableTwoFactorDescription")}
                      </p>
                    </div>
                    <Switch defaultChecked={false} id="two-factor" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
