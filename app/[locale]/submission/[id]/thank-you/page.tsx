"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

type ThemeType = {
  id: string;
  name: string;
  description?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: number;
};

type FormData = {
  id: string;
  name: string;
  description: string | null;
  theme?: ThemeType;
};

export default function ThankYouPage() {
  const t = useTranslations("dashboard.thankYou");
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formTheme, setFormTheme] = useState<ThemeType | undefined>(undefined);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`/api/public-forms/${formId}/basic`);
        const formData = response.data;

        setForm(formData);

        if (formData.theme) {
          setFormTheme(formData.theme);
        }
      } catch (error) {
        console.error("Error fetching form:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const getStyles = () => {
    if (!formTheme) return {};

    return {
      container: {
        backgroundColor: formTheme.backgroundColor,
        color: formTheme.textColor,
        fontFamily: formTheme.fontFamily,
      },
      card: {
        borderColor: formTheme.accentColor,
        borderRadius: `${formTheme.borderRadius}px`,
      },
      button: {
        backgroundColor: formTheme.primaryColor,
        color: "#ffffff",
        borderRadius: `${formTheme.borderRadius}px`,
      },
      icon: {
        color: formTheme.primaryColor,
      },
    };
  };

  const styles = getStyles();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6" style={styles.container}>
      <div className="max-w-2xl mx-auto">
        <Card style={styles.card}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle2 size={64} style={styles.icon} className="mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-lg">
              {t("message", { formName: form?.name || "the form" })}
            </p>

            <p className="text-muted-foreground">{t("description")}</p>

            <div className="pt-4">
              <Button
                onClick={() => {
                  const locale = params.locale as string;
                  router.push(`/${locale}/submission/${formId}`);
                }}
                style={styles.button}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("backToForm")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
