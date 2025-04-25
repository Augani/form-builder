import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Animation,
  FormLayout,
  FormSpacing,
  AnimationSpeed,
} from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FieldType = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
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
  isDefault?: boolean;
  defaultAnimation: Animation;
  defaultLayout: FormLayout;
  defaultSpacing: FormSpacing;
  borderRadius: number;
};

const PreviewFormField = ({
  field,
  theme,
}: {
  field: FieldType;
  theme?: ThemeType;
}): React.ReactNode => {
  const t = useTranslations("dashboard.formBuilder");

  const fieldStyle = theme
    ? {
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }
    : {};

  const inputStyle = theme
    ? {
        borderColor: theme.primaryColor,
        borderRadius: `${theme.borderRadius}px`,
      }
    : {};

  switch (field.type.toLowerCase()) {
    case "text":
    case "email":
    case "number":
      return (
        <div className="mb-4" style={fieldStyle}>
          <Label htmlFor={`preview-${field.id}`} className="block mb-2">
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={`preview-${field.id}`}
            type={field.type}
            placeholder={field.placeholder}
            disabled
            style={inputStyle}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="mb-4" style={fieldStyle}>
          <Label htmlFor={`preview-${field.id}`} className="block mb-2">
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id={`preview-${field.id}`}
            placeholder={field.placeholder}
            disabled
            className="resize-none h-24"
            style={inputStyle}
          />
        </div>
      );

    case "select":
      return (
        <div className="mb-4" style={fieldStyle}>
          <Label htmlFor={`preview-${field.id}`} className="block mb-2">
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          <Select disabled>
            <SelectTrigger id={`preview-${field.id}`} style={inputStyle}>
              <SelectValue
                placeholder={field.placeholder || t("selectAnOption")}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option || `option-${index}`}>
                  {option || `${t("option")} ${index + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "radio":
      return (
        <div className="mb-4" style={fieldStyle}>
          <Label className="block mb-2">
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          <RadioGroup disabled defaultValue={field.options?.[0]}>
            {field.options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 mt-1"
                style={inputStyle}
              >
                <RadioGroupItem
                  value={option || `option-${index}`}
                  id={`preview-radio-${field.id}-${index}`}
                />
                <Label htmlFor={`preview-radio-${field.id}-${index}`}>
                  {option || `${t("option")} ${index + 1}`}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case "checkbox":
      return (
        <div className="mb-4" style={fieldStyle}>
          <Label className="block mb-2">
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          {field.options?.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 mt-1"
              style={inputStyle}
            >
              <Checkbox id={`preview-checkbox-${field.id}-${index}`} disabled />
              <Label htmlFor={`preview-checkbox-${field.id}-${index}`}>
                {option || `${t("option")} ${index + 1}`}
              </Label>
            </div>
          ))}
        </div>
      );

    case "date":
      return (
        <div className="mb-4" style={fieldStyle}>
          <Label htmlFor={`preview-${field.id}`} className="block mb-2">
            {field.label}{" "}
            {field.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={`preview-${field.id}`}
            type="date"
            disabled
            style={inputStyle}
          />
        </div>
      );

    default:
      return null;
  }
};

export const FormPreview = ({
  formName,
  formDescription,
  fields,
  theme,
  animation,
  animationSpeed,
  showAnimationPreview,
  showProgressBar = true,
  collectEmails = false,
  layout = "standard",
}: {
  formName: string;
  formDescription?: string;
  fields: FieldType[];
  theme?: ThemeType;
  animation?: Animation;
  animationSpeed?: AnimationSpeed;
  showAnimationPreview?: boolean;
  showProgressBar?: boolean;
  collectEmails?: boolean;
  layout?: string;
}): React.ReactNode => {
  const t = useTranslations("dashboard.formBuilder");
  const [isAnimating, setIsAnimating] = useState(false);
  const [key, setKey] = useState(0); // Used to force re-render for animations
  const currentStep = 0; // Fixed value for preview

  const totalSteps =
    layout === "step" ? fields.length + (collectEmails ? 1 : 0) : 1;

  const progress =
    layout === "step" ? ((currentStep + 1) / totalSteps) * 100 : 50; // Default to 50% for preview

  const formStyle = theme
    ? {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        borderRadius: `${theme.borderRadius}px`,
        borderColor: theme.accentColor,
      }
    : {};

  const buttonStyle = theme
    ? {
        backgroundColor: theme.primaryColor,
        color: "#ffffff",
        borderRadius: `${theme.borderRadius}px`,
      }
    : {};

  const progressBarStyles = theme
    ? ({
        backgroundColor: theme.secondaryColor || "#e5e7eb",
        "--progress-color": theme.primaryColor || "#3b82f6",
      } as React.CSSProperties)
    : {};

  const getAnimationSettings = () => {
    if (!showAnimationPreview || !animation || animation === "NONE") {
      return {};
    }

    const speed = {
      SLOW: 0.8,
      MEDIUM: 0.5,
      FAST: 0.3,
    }[animationSpeed || "MEDIUM"] as number;

    const animations = {
      none: {},
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: speed },
      },
      slide: {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -50, opacity: 0 },
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
      animation?.toLowerCase() === "none"
        ? "none"
        : animation?.toLowerCase() || "none";

    return (
      animations[animationKey as keyof typeof animations] || animations.none
    );
  };

  useEffect(() => {
    if (showAnimationPreview) {
      setIsAnimating(false);
      setKey((prev) => prev + 1);
      setTimeout(() => setIsAnimating(true), 50);
    }
  }, [showAnimationPreview, animation, animationSpeed]);

  const animationSettings = getAnimationSettings();

  return (
    <Card className="border shadow-sm" style={formStyle}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">
          {formName || t("formNamePlaceholder")}
        </CardTitle>
        {formDescription && (
          <p className="text-muted-foreground mt-2">{formDescription}</p>
        )}

        {/* Progress bar */}
        {showProgressBar && (
          <div className="mt-4">
            <Progress
              value={progress}
              max={100}
              className="h-2 bg-secondary"
              style={progressBarStyles}
            />
            {layout === "step" && (
              <div className="text-sm text-muted-foreground mt-1 text-right">
                {currentStep + 1} / {totalSteps}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`preview-${key}`}
            {...(Object.keys(animationSettings).length > 0 && isAnimating
              ? animationSettings
              : {})}
          >
            {collectEmails && (
              <div
                className="mb-4"
                style={{
                  color: theme?.textColor,
                  fontFamily: theme?.fontFamily,
                }}
              >
                <Label htmlFor="preview-email" className="block mb-2">
                  {t("emailAddress")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="preview-email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  disabled
                  style={{
                    borderColor: theme?.primaryColor,
                    borderRadius: `${theme?.borderRadius || 4}px`,
                  }}
                />
              </div>
            )}

            {fields.map((field) => (
              <PreviewFormField key={field.id} field={field} theme={theme} />
            ))}

            <Button className="mt-4" disabled style={buttonStyle}>
              {t("submit")}
            </Button>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
