"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

type FieldType = {
  id: string;
  formId: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  order: number;
};

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
  status: string;
  collectEmails: boolean;
  limitOneResponsePerUser: boolean;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  themeId: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
  fontFamily: string | null;
  animation: string;
  animationSpeed: string;
  layout: string;
  spacing: string;
  borderRadius: number;
  fields: FieldType[];
  theme?: ThemeType;
};

interface FormValues {
  email?: string;
  [key: string]: string | string[] | undefined;
}

export default function FormSubmissionPage() {
  const t = useTranslations("dashboard.formSubmission");
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formTheme, setFormTheme] = useState<ThemeType | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState(0);
  const [fields, setFields] = useState<FieldType[]>([]);

  const generateFormSchema = (fields: FieldType[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    if (form?.collectEmails) {
      schemaFields.email = z.string().email(t("emailRequired"));
    }
    fields.forEach((field) => {
      const key = `field_${field.id}`;
      if (field.type === "checkbox") {
        schemaFields[key] = z.array(z.string()).optional();
        return;
      }
      let fieldSchema = z.string();
      if (field.type === "email") {
        fieldSchema = z
          .string()
          .email(t("invalidEmail", { label: field.label }));
      } else if (field.type === "number") {
        if (field.required) {
          schemaFields[key] = z
            .string()
            .min(1, t("fieldRequired", { label: field.label }))
            .refine((val) => !isNaN(Number(val)), {
              message: t("invalidNumber", { label: field.label }),
            });
        } else {
          schemaFields[key] = z
            .string()
            .optional()
            .refine(
              (val) => val === undefined || val === "" || !isNaN(Number(val)),
              {
                message: t("invalidNumber", { label: field.label }),
              }
            );
        }
      } else {
        schemaFields[key] = field.required
          ? fieldSchema.min(1, t("fieldRequired", { label: field.label }))
          : fieldSchema.optional();
      }
    });
    return z.object(schemaFields);
  };

  const generateDefaultValues = (formData: FormData | null): FormValues => {
    if (!formData) return {};

    const defaults: FormValues = {};

    if (formData.collectEmails) {
      defaults.email = "";
    }

    formData.fields.forEach((field) => {
      const key = `field_${field.id}`;
      if (field.type === "checkbox") {
        defaults[key] = [];
      } else {
        defaults[key] = "";
      }
    });

    return defaults;
  };

  const schema = form?.fields ? generateFormSchema(form.fields) : z.object({});

  const formHook = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: generateDefaultValues(form),
  });

  const formValues = formHook.watch();

  const calculateProgress = () => {
    if (!form) return 0;

    const fieldKeys = fields.map((field) => `field_${field.id}`);
    if (form.collectEmails) {
      fieldKeys.push("email");
    }

    const filledFields = fieldKeys.filter((key) => {
      const value = formValues[key];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }).length;

    return fieldKeys.length > 0 ? (filledFields / fieldKeys.length) * 100 : 0;
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`/api/public-forms/${formId}`);
        const data = response.data;
        setForm(data);

        let fieldsToRender = [...data.fields];
        if (data.shuffleQuestions) {
          fieldsToRender = [...fieldsToRender].sort(() => Math.random() - 0.5);
        } else {
          fieldsToRender = fieldsToRender.sort((a, b) => a.order - b.order);
        }
        setFields(fieldsToRender);

        if (data.theme) setFormTheme(data.theme);

        formHook.reset(generateDefaultValues(data));
      } catch (error) {
        console.error(error);
        toast.error(t("formNotFoundDesc"));
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId, t, formHook]);

  useEffect(() => {
    const radius = formTheme?.borderRadius ?? form?.borderRadius ?? 4;
    document.documentElement.style.setProperty(
      "--border-radius",
      `${radius}px`
    );
  }, [form, formTheme]);

  const steps = useMemo(() => {
    if (!form || !fields.length) return [];

    if (form.layout !== "step") {
      return [fields];
    }

    const allSteps = [];
    if (form.collectEmails) {
      allSteps.push([
        {
          id: "email",
          formId: formId,
          type: "email",
          label: t("emailAddress"),
          placeholder: t("emailPlaceholder"),
          required: true,
          options: [],
          order: -1,
        },
      ]);
    }

    fields.forEach((field) => {
      allSteps.push([field]);
    });

    return allSteps;
  }, [form, fields, formId, t]);

  const isStepLayout = form?.layout === "step";
  const totalSteps = steps.length;
  const progress = isStepLayout
    ? ((currentStep + 1) / totalSteps) * 100
    : calculateProgress();

  const handleNextStep = async () => {
    const fieldsInCurrentStep = steps[currentStep];
    const fieldIds = fieldsInCurrentStep.map((f) =>
      f.id === "email" ? "email" : `field_${f.id}`
    );

    const isValid = await formHook.trigger(fieldIds);

    if (isValid) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        await formHook.handleSubmit(onSubmit)();
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!form || !form.fields) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("loading")}</p>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold">{t("formNotFound")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("formNotFoundDesc")}
            </p>
          </div>
        )}
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const responses = Object.entries(values)
        .filter(([key]) => key !== "email")
        .map(([key, value]) => ({ fieldId: key.replace("field_", ""), value }))
        .filter(Boolean);

      const payload = {
        email: form.collectEmails ? values.email : undefined,
        responses,
      };
      const res = await axios.post(`/api/forms/${formId}/submit`, payload);
      if (res.data.success) {
        toast.success(t("submitSuccess"));
        router.push(`/${params.locale}/submission/${formId}/thank-you`);
      }
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as Error & {
        response?: { data?: { error?: string } };
      };
      const errorMessage = errorObj?.response?.data?.error || t("submitError");
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getAnimationSettings = () => {
    const speed = {
      SLOW: 0.8,
      MEDIUM: 0.5,
      FAST: 0.3,
    }[form.animationSpeed || "MEDIUM"] as number;

    const animations = {
      none: {},
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: speed },
      },
      slide: {
        initial: { x: 50, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 },
        transition: { duration: speed },
      },
      scale: {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        transition: { duration: speed },
      },
      bounce: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 20, opacity: 0 },
        transition: {
          duration: speed,
          type: "spring",
          stiffness: 300,
          damping: 15,
        },
      },
      zoom: {
        initial: { scale: 0.7, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.7, opacity: 0 },
        transition: { duration: speed },
      },
    };

    const animationKey =
      form.animation?.toLowerCase() === "none"
        ? "none"
        : form.animation?.toLowerCase() || "none";

    return (
      animations[animationKey as keyof typeof animations] || animations.none
    );
  };

  const styles = (() => {
    const radius = formTheme?.borderRadius ?? form?.borderRadius ?? 4;
    const spacingMap = {
      compact: "space-y-3",
      normal: "space-y-6",
      relaxed: "space-y-8",
    };

    return {
      container: {
        backgroundColor:
          formTheme?.backgroundColor || form?.backgroundColor || "#fff",
        color: formTheme?.textColor || "#000",
        fontFamily: formTheme?.fontFamily || form?.fontFamily || "inherit",
      },
      card: {
        borderColor: formTheme?.accentColor || "#e2e8f0",
        borderRadius: `${radius}px`,
      },
      button: {
        backgroundColor:
          formTheme?.primaryColor || form?.primaryColor || "#3b82f6",
        color: "#fff",
        borderRadius: `${radius}px`,
      },
      secondaryButton: {
        backgroundColor:
          formTheme?.secondaryColor || form?.secondaryColor || "#e5e7eb",
        color: "#000",
        borderRadius: `${radius}px`,
      },
      input: {
        borderColor: formTheme?.primaryColor || form?.primaryColor || "#3b82f6",
        borderRadius: `${radius}px`,
      },
      fieldContainer: {
        color: formTheme?.textColor || "#000",
        fontFamily: formTheme?.fontFamily || form?.fontFamily || "inherit",
      },
      checkboxContainer: {
        overflow: "hidden",
        borderRadius: `${Math.max(radius - 2, 0)}px`,
      },
      selectTrigger: {
        borderColor: formTheme?.primaryColor || form?.primaryColor || "#3b82f6",
        borderRadius: `${radius}px`,
      },
      selectContent: { borderRadius: `${radius}px` },
      progressBar: {
        backgroundColor:
          formTheme?.secondaryColor || form?.secondaryColor || "#e5e7eb",
      },
      progressBarFill: {
        backgroundColor:
          formTheme?.primaryColor || form?.primaryColor || "#3b82f6",
      },
      spacingClass:
        spacingMap[form.spacing as keyof typeof spacingMap] ||
        spacingMap.normal,
    };
  })();

  const getFieldsToDisplay = () => {
    if (!isStepLayout) {
      return fields;
    }
    return steps[currentStep] || [];
  };

  const renderFormField = (field: FieldType) => {
    const key = `field_${field.id}`;

    switch (field.type.toLowerCase()) {
      case "text":
      case "email":
      case "number":
        return (
          <FormField
            key={field.id}
            control={formHook.control}
            name={key}
            render={({ field: f }) => (
              <FormItem style={styles.fieldContainer}>
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Input
                    type={field.type.toLowerCase()}
                    placeholder={field.placeholder}
                    style={styles.input}
                    value={f.value || ""}
                    onChange={f.onChange}
                    onBlur={f.onBlur}
                    name={f.name}
                    ref={f.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "textarea":
        return (
          <FormField
            key={field.id}
            control={formHook.control}
            name={key}
            render={({ field: f }) => (
              <FormItem style={styles.fieldContainer}>
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.placeholder}
                    style={styles.input}
                    value={f.value || ""}
                    onChange={f.onChange}
                    onBlur={f.onBlur}
                    name={f.name}
                    ref={f.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "select":
        return (
          <FormField
            key={field.id}
            control={formHook.control}
            name={key}
            render={({ field: f }) => (
              <FormItem style={styles.fieldContainer}>
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <Select
                  onValueChange={f.onChange}
                  value={(f.value as string) || ""}
                >
                  <FormControl>
                    <SelectTrigger style={styles.selectTrigger}>
                      <SelectValue
                        placeholder={field.placeholder || "Select an option"}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent style={styles.selectContent}>
                    {field.options.map((opt, i) => (
                      <SelectItem key={i} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "radio":
        return (
          <FormField
            key={field.id}
            control={formHook.control}
            name={key}
            render={({ field: f }) => (
              <FormItem className="space-y-3" style={styles.fieldContainer}>
                <FormLabel>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={f.onChange}
                    value={(f.value as string) || ""}
                    className="flex flex-col space-y-1"
                  >
                    {field.options.map((opt, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`${key}-${i}`} />
                        <Label htmlFor={`${key}-${i}`}>{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "checkbox":
        return (
          <FormField
            key={field.id}
            control={formHook.control}
            name={key}
            render={({ field: f }) => (
              <FormItem style={styles.fieldContainer}>
                <div style={styles.checkboxContainer} className="mb-4">
                  <FormLabel>
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                </div>
                <div className="space-y-2">
                  {field.options.map((opt, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${key}-${i}`}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(f.value)
                            ? [...f.value]
                            : [];
                          if (checked) {
                            if (!currentValues.includes(opt)) {
                              f.onChange([...currentValues, opt]);
                            }
                          } else {
                            f.onChange(currentValues.filter((v) => v !== opt));
                          }
                        }}
                        checked={
                          Array.isArray(f.value) && f.value.includes(opt)
                        }
                      />
                      <Label htmlFor={`${key}-${i}`}>{opt}</Label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };

  const fieldsToDisplay = getFieldsToDisplay();
  const animationSettings = getAnimationSettings();

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6" style={styles.container}>
      <div className="max-w-3xl mx-auto">
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{form.name}</CardTitle>
            {form.description && (
              <p className="text-muted-foreground mt-2">{form.description}</p>
            )}

            {/* Progress bar */}
            {form.showProgressBar && (
              <div className="mt-4">
                <Progress
                  value={progress}
                  max={100}
                  className="h-2 bg-secondary"
                  style={
                    {
                      backgroundColor: styles.progressBar.backgroundColor,
                      "--progress-color":
                        styles.progressBarFill.backgroundColor,
                    } as React.CSSProperties
                  }
                />
                {isStepLayout && (
                  <div className="text-sm text-muted-foreground mt-1 text-right">
                    {currentStep + 1} / {totalSteps}
                  </div>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Form {...formHook}>
              <form
                onSubmit={formHook.handleSubmit(onSubmit)}
                className={`${styles.spacingClass}`}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`step-${currentStep}`}
                    {...(Object.keys(animationSettings).length > 0
                      ? animationSettings
                      : {})}
                  >
                    {!isStepLayout && form.collectEmails && (
                      <FormField
                        control={formHook.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem style={styles.fieldContainer}>
                            <FormLabel>{t("emailAddress")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("emailPlaceholder")}
                                type="email"
                                style={styles.input}
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                              />
                            </FormControl>
                            <FormDescription>
                              {form.limitOneResponsePerUser
                                ? t("oneResponseLimit")
                                : t("emailCollectionNotice")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Render fields appropriate for the current step or layout */}
                    <div className={styles.spacingClass}>
                      {fieldsToDisplay.map((field) => renderFormField(field))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation buttons for step layout */}
                {isStepLayout ? (
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={currentStep === 0 || submitting}
                      style={styles.secondaryButton}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft size={16} />
                      {t("previous")}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={submitting}
                      style={styles.button}
                      className="flex items-center gap-1"
                    >
                      {currentStep === totalSteps - 1
                        ? submitting
                          ? t("submitting")
                          : t("submit")
                        : t("next")}
                      {currentStep !== totalSteps - 1 && (
                        <ChevronRight size={16} />
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    style={styles.button}
                  >
                    {submitting ? t("submitting") : t("submit")}
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
