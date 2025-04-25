"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, ArrowLeft, Eye, Palette, Play } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Animation, AnimationSpeed, FormStatus } from "@prisma/client";
import apiClient from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SortableField } from "@/components/form-builder/sortable-field";
import { Label } from "@/components/ui/label";

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
  defaultLayout?: string;
  defaultSpacing?: string;
  borderRadius: number;
};

type FieldType = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  _action?: "create" | "update" | "delete";
};

interface FormData {
  id: string;
  name: string;
  description: string | null;
  status: FormStatus;
  collectEmails: boolean;
  limitOneResponsePerUser: boolean;
  showProgressBar: boolean;
  shuffleQuestions: boolean;
  themeId: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
  fontFamily: string | null;
  animation: Animation;
  animationSpeed: AnimationSpeed;
  fields: Array<{
    id: string;
    type: string;
    label: string;
    placeholder: string | null;
    required: boolean;
    options: string[];
    order: number;
  }>;
}

const FormPreview = ({
  formName,
  formDescription,
  fields,
  theme,
  animation,
  animationSpeed,
  showAnimationPreview,
}: {
  formName: string;
  formDescription?: string;
  fields: FieldType[];
  theme?: ThemeType;
  animation?: Animation;
  animationSpeed?: AnimationSpeed;
  showAnimationPreview?: boolean;
}): React.ReactNode => {
  const t = useTranslations("dashboard.formBuilder");
  const [isAnimating, setIsAnimating] = useState(false);

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

  const getAnimationClass = () => {
    if (!showAnimationPreview || !animation || animation === "NONE") return "";

    const speedClass =
      animationSpeed === "FAST"
        ? "duration-300"
        : animationSpeed === "SLOW"
        ? "duration-1000"
        : "duration-500";

    switch (animation) {
      case "FADE":
        return isAnimating ? `animate-in fade-in ${speedClass}` : "opacity-0";
      case "SLIDE":
        return isAnimating
          ? `animate-in slide-in-from-bottom ${speedClass}`
          : "opacity-0 -translate-y-4";
      case "ZOOM":
        return isAnimating
          ? `animate-in zoom-in ${speedClass}`
          : "opacity-0 scale-95";
      case "BOUNCE":
        return isAnimating ? `animate-bounce ${speedClass}` : "";
      case "SCALE":
        return isAnimating
          ? `animate-in zoom-in ${speedClass}`
          : "opacity-0 scale-90";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (showAnimationPreview) {
      setIsAnimating(false);
      setTimeout(() => setIsAnimating(true), 100);
    }
  }, [showAnimationPreview, animation, animationSpeed]);

  const PreviewFormField = ({
    field,
  }: {
    field: FieldType;
  }): React.ReactNode => {
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
                <Checkbox
                  id={`preview-checkbox-${field.id}-${index}`}
                  disabled
                />
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

  return (
    <div
      className={`border p-6 rounded-lg ${getAnimationClass()}`}
      style={formStyle}
    >
      {formName ? (
        <h2 className="text-xl font-bold mb-2">{formName}</h2>
      ) : (
        <h2 className="text-xl font-bold mb-2 text-muted-foreground">
          {t("formNamePlaceholder")}
        </h2>
      )}

      {formDescription ? (
        <p className="text-muted-foreground mb-6">{formDescription}</p>
      ) : (
        <p className="text-muted-foreground mb-6 italic">
          {t("formDescriptionPlaceholder")}
        </p>
      )}

      {fields.map((field) => (
        <PreviewFormField key={field.id} field={field} />
      ))}

      <Button className="mt-4" disabled style={buttonStyle}>
        {t("submit")}
      </Button>
    </div>
  );
};

export default function EditFormPage() {
  const t = useTranslations("forms");
  const router = useRouter();
  const params = useParams();
  const formId = params.formId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fields, setFields] = useState<FieldType[]>([]);
  const formFieldsContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("settings");
  const [formStatus, setFormStatus] = useState<FormStatus>("DRAFT");
  const [collectEmails, setCollectEmails] = useState(false);
  const [limitOneResponse, setLimitOneResponse] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState<ThemeType | undefined>();

  const [selectedAnimation, setSelectedAnimation] = useState<Animation>("NONE");
  const [animationSpeed, setAnimationSpeed] =
    useState<AnimationSpeed>("MEDIUM");
  const [showAnimationPreview, setShowAnimationPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formSchema = z.object({
    title: z.string().min(3, t("nameRequired")),
    description: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await apiClient.get(`/api/forms/${formId}`);
        const formData: FormData = response.data;

        form.reset({
          title: formData.name,
          description: formData.description || "",
        });

        setSelectedAnimation(formData.animation);
        setAnimationSpeed(formData.animationSpeed);

        const formattedFields = formData.fields.map((field) => ({
          id: field.id,
          type: field.type.toLowerCase(),
          label: field.label,
          placeholder: field.placeholder || "",
          required: field.required,
          options: field.options,
        }));

        setFields(formattedFields);

        setFormStatus(formData.status);
        setCollectEmails(formData.collectEmails);
        setLimitOneResponse(formData.limitOneResponsePerUser);
        setShowProgressBar(formData.showProgressBar);
        setShuffleQuestions(formData.shuffleQuestions);

        if (formData.themeId) {
          try {
            const themeResponse = await apiClient.get(
              `/api/themes/${formData.themeId}`
            );
            if (themeResponse.data) {
              setSelectedTheme(themeResponse.data);
            }
          } catch (themeError) {
            console.error("Error fetching theme:", themeError);
          }
        }
      } catch (error) {
        console.error("Error fetching form:", error);
        toast.error(t("errorLoadingForm"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [formId, form, t]);

  const triggerAnimationPreview = () => {
    setShowAnimationPreview(false);
    setTimeout(() => {
      setShowAnimationPreview(true);
      setActiveTab("preview");
    }, 100);
  };

  useEffect(() => {
    if (selectedTheme && selectedAnimation === "NONE") {
      setSelectedAnimation(selectedTheme.defaultAnimation);
    }
  }, [selectedTheme, selectedAnimation]);

  const scrollToBottom = useCallback(() => {
    if (formFieldsContainerRef.current) {
      formFieldsContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const addField = useCallback(() => {
    setFields([
      ...fields,
      {
        id: "new_field_" + Date.now(),
        type: "text",
        label: "",
        placeholder: "",
        required: false,
        _action: "create",
      },
    ]);
  }, [fields]);

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);

    const hasEmptyLabels = fields.some((field) => !field.label.trim());
    if (hasEmptyLabels) {
      toast.error(t("allFieldsNeedLabels"));
      setIsSaving(false);
      return;
    }

    try {
      const formData = {
        name: values.title,
        description: values.description || "",
        status: formStatus,
        collectEmails: collectEmails,
        limitOneResponsePerUser: limitOneResponse,
        showProgressBar: showProgressBar,
        shuffleQuestions: shuffleQuestions,
        themeId: selectedTheme?.id || null,
        animation: selectedAnimation,
        animationSpeed: animationSpeed,
        fields: fields.map((field) => {
          const isNewField = field.id.startsWith("new_field_");

          return {
            id: isNewField ? undefined : field.id,
            type: field.type.toUpperCase(),
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options || [],
            _action: isNewField ? "create" : "update",
          };
        }),
      };

      const response = await apiClient.put(`/api/forms/${formId}`, formData);

      if (response.data) {
        toast.success(t("formUpdated"));
        router.push(`/dashboard/forms/${formId}`);
      } else {
        toast.error(t("errorUpdatingForm"));
      }
    } catch (error) {
      console.error("Error updating form:", error);
      toast.error(t("errorUpdatingForm"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = [...fields];
        const [movedItem] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, movedItem);
        setFields(newFields);
      }
    }
  };

  const handleAddField = (type: string) => {
    const newField: FieldType = {
      id: Date.now().toString(),
      type,
      label: "",
      required: false,
      placeholder: "",
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? ["Option 1"]
          : undefined,
    };
    setFields([...fields, newField]);

    setTimeout(() => {
      if (formFieldsContainerRef.current) {
        formFieldsContainerRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FieldType>) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const handleRemoveField = (fieldId: string) => {
    console.log("Attempting to remove field with ID:", fieldId);

    if (fields.length > 1) {
      const updatedFields = fields.filter((field) => field.id !== fieldId);
      console.log("Fields before:", fields.length);
      console.log("Fields after:", updatedFields.length);

      setFields(updatedFields);

      toast.success("Field removed successfully");
    } else {
      toast.error(t("formBuilder.cannotRemoveLastField"));
    }
  };

  const handleAddOption = (fieldId: string) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId) {
          const options = field.options || [];
          return {
            ...field,
            options: [...options, ""],
          };
        }
        return field;
      })
    );
  };

  const handleUpdateOption = (
    fieldId: string,
    optionIndex: number,
    value: string
  ) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId && field.options) {
          const newOptions = [...field.options];
          newOptions[optionIndex] = value;
          return {
            ...field,
            options: newOptions,
          };
        }
        return field;
      })
    );
  };

  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    setFields(
      fields.map((field) => {
        if (field.id === fieldId && field.options && field.options.length > 1) {
          const newOptions = [...field.options];
          newOptions.splice(optionIndex, 1);
          return {
            ...field,
            options: newOptions,
          };
        }
        return field;
      })
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between sticky py-6 z-10 top-0 bg-background">
          <h1 className="text-2xl font-bold">
            <Skeleton className="h-8 w-48" />
          </h1>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between sticky py-6 z-10 top-0 bg-background">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t("editForm")}</h1>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSaving || !form.formState.isValid}
        >
          <Save className="mr-2 h-4 w-4" />
          {t("saveChanges")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("formDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("formName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("formNamePlaceholder")}
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("formDescription")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("formDescriptionPlaceholder")}
                            className="resize-none h-24"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card ref={formFieldsContainerRef}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("formFields")}</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  addField();
                  scrollToBottom();
                }}
                disabled={isSaving}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("addField")}
              </Button>
            </CardHeader>
            <CardContent>
              {fields.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t("noFieldsYet")}
                </p>
              ) : (
                <div className="space-y-6">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={fields.map((field) => field.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {fields.map((field, index) => (
                        <div key={field.id} className="mb-4">
                          <SortableField
                            field={field}
                            index={index}
                            onUpdate={handleUpdateField}
                            onDelete={handleRemoveField}
                            onAddOption={handleAddOption}
                            onUpdateOption={handleUpdateOption}
                            onRemoveOption={handleRemoveOption}
                          />
                        </div>
                      ))}
                    </SortableContext>
                  </DndContext>

                  {/* Add Field Button UI */}
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">
                        {t("formBuilder.field.addNewField")}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddField("text")}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("formBuilder.addFieldButtons.text")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddField("email")}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("formBuilder.addFieldButtons.email")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddField("number")}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("formBuilder.addFieldButtons.number")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddField("textarea")}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("formBuilder.addFieldButtons.textarea")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddField("select")}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("formBuilder.addFieldButtons.select")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddField("radio")}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("formBuilder.addFieldButtons.radio")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddField("checkbox")}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("formBuilder.addFieldButtons.checkbox")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddField("date")}
                        className="justify-start"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("formBuilder.addFieldButtons.date")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">{t("formSettings")}</TabsTrigger>
              <TabsTrigger value="theme" className="flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                {t("theme")}
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                {t("preview")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>{t("formSettings")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      {t("formStatus")}
                    </h3>
                    <Select
                      value={formStatus}
                      onValueChange={(value: FormStatus) =>
                        setFormStatus(value)
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">
                          {t("status.draft")}
                        </SelectItem>
                        <SelectItem value="ACTIVE">
                          {t("status.active")}
                        </SelectItem>
                        <SelectItem value="INACTIVE">
                          {t("status.inactive")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="collect-email"
                      checked={collectEmails}
                      onCheckedChange={setCollectEmails}
                      disabled={isSaving}
                    />
                    <label
                      htmlFor="collect-email"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t("collectEmailAddresses")}
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="one-response"
                      checked={limitOneResponse}
                      onCheckedChange={setLimitOneResponse}
                      disabled={isSaving}
                    />
                    <label
                      htmlFor="one-response"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t("limitOneResponsePerPerson")}
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-progress"
                      checked={showProgressBar}
                      onCheckedChange={setShowProgressBar}
                      disabled={isSaving}
                    />
                    <label
                      htmlFor="show-progress"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t("showProgressBar")}
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="shuffle-questions"
                      checked={shuffleQuestions}
                      onCheckedChange={setShuffleQuestions}
                      disabled={isSaving}
                    />
                    <label
                      htmlFor="shuffle-questions"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t("shuffleQuestions")}
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme">
              <Card>
                <CardHeader>
                  <CardTitle>{t("formTheme")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <ThemeSelector
                      theme={selectedTheme}
                      onSelectTheme={setSelectedTheme}
                    />

                    <AnimationSelector
                      value={selectedAnimation}
                      onChange={setSelectedAnimation}
                      speed={animationSpeed}
                      onSpeedChange={setAnimationSpeed}
                      onPreview={triggerAnimationPreview}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>{t("livePreview")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormPreview
                    formName={form.watch("title")}
                    formDescription={form.watch("description")}
                    fields={fields}
                    theme={selectedTheme}
                    animation={selectedAnimation}
                    animationSpeed={animationSpeed}
                    showAnimationPreview={showAnimationPreview}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ThemeSelector({
  theme,
  onSelectTheme,
}: {
  theme: ThemeType | undefined;
  onSelectTheme: (theme: ThemeType) => void;
}) {
  const t = useTranslations("dashboard.formBuilder");
  const [themes, setThemes] = useState<ThemeType[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType | null>(
    theme || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await apiClient.get("/api/themes/default");
        const result = response.data;

        if (result) {
          setThemes(result.themes);
          if (result.themes.length > 0) {
            if (!selectedTheme) {
              setSelectedTheme(result.themes[0]);
              onSelectTheme(result.themes[0]);
            }
          }
        } else {
          setError("Failed to load themes");
        }
      } catch (err) {
        setError("Error loading themes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [onSelectTheme, selectedTheme]);

  const handleThemeSelect = (theme: ThemeType) => {
    setSelectedTheme(theme);
    onSelectTheme(theme);
  };

  const handleThemePropertyChange = (
    property: keyof ThemeType,
    value: string | number
  ) => {
    if (!selectedTheme) return;

    const updatedTheme = {
      ...selectedTheme,
      [property]: value,
    };

    setSelectedTheme(updatedTheme);
    onSelectTheme(updatedTheme);
  };

  if (loading) return <div>Loading themes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!selectedTheme) return <div>No theme selected</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("selectTheme")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
              selectedTheme.id === theme.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleThemeSelect(theme)}
            style={{
              backgroundColor: theme.backgroundColor,
              color: theme.textColor,
              borderColor: theme.primaryColor,
              borderRadius: `${theme.borderRadius}px`,
            }}
          >
            <h4 className="font-medium" style={{ color: theme.textColor }}>
              {theme.name}
            </h4>
            <p
              className="text-sm opacity-80"
              style={{ color: theme.textColor }}
            >
              {theme.description}
            </p>
            <div className="flex mt-2 space-x-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: theme.primaryColor }}
              ></div>
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: theme.secondaryColor }}
              ></div>
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: theme.accentColor }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-medium mt-8">{t("customizeTheme")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">
            {t("primaryColor")}
          </label>
          <div className="flex">
            <Input
              type="color"
              value={selectedTheme.primaryColor}
              onChange={(e) =>
                handleThemePropertyChange("primaryColor", e.target.value)
              }
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={selectedTheme.primaryColor}
              onChange={(e) =>
                handleThemePropertyChange("primaryColor", e.target.value)
              }
              className="ml-2 flex-1"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">
            {t("backgroundColor")}
          </label>
          <div className="flex">
            <Input
              type="color"
              value={selectedTheme.backgroundColor}
              onChange={(e) =>
                handleThemePropertyChange("backgroundColor", e.target.value)
              }
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={selectedTheme.backgroundColor}
              onChange={(e) =>
                handleThemePropertyChange("backgroundColor", e.target.value)
              }
              className="ml-2 flex-1"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">
            {t("textColor")}
          </label>
          <div className="flex">
            <Input
              type="color"
              value={selectedTheme.textColor}
              onChange={(e) =>
                handleThemePropertyChange("textColor", e.target.value)
              }
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={selectedTheme.textColor}
              onChange={(e) =>
                handleThemePropertyChange("textColor", e.target.value)
              }
              className="ml-2 flex-1"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">
            {t("borderRadius")}
          </label>
          <Input
            type="range"
            min="0"
            max="20"
            value={selectedTheme.borderRadius}
            onChange={(e) =>
              handleThemePropertyChange(
                "borderRadius",
                parseInt(e.target.value)
              )
            }
          />
          <div className="text-sm text-center">
            {selectedTheme.borderRadius}px
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimationSelector({
  value,
  onChange,
  speed,
  onSpeedChange,
  onPreview,
}: {
  value: Animation;
  onChange: (value: Animation) => void;
  speed: AnimationSpeed;
  onSpeedChange: (value: AnimationSpeed) => void;
  onPreview: () => void;
}) {
  const t = useTranslations("dashboard.formBuilder");

  return (
    <div className="space-y-4 mt-8 border-t pt-6">
      <h3 className="text-lg font-medium">{t("formAnimation")}</h3>
      <div>
        <label className="text-sm font-medium block mb-1">
          {t("animation")}
        </label>
        <div className="flex space-x-2">
          <Select
            value={value}
            onValueChange={(val) => onChange(val as Animation)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={t("selectAnimation")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">{t("animations.none")}</SelectItem>
              <SelectItem value="FADE">{t("animations.fade")}</SelectItem>
              <SelectItem value="SLIDE">{t("animations.slide")}</SelectItem>
              <SelectItem value="ZOOM">{t("animations.zoom")}</SelectItem>
              <SelectItem value="BOUNCE">{t("animations.bounce")}</SelectItem>
              <SelectItem value="SCALE">{t("animations.scale")}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={onPreview}
            disabled={value === "NONE"}
            title={t("previewAnimation")}
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {value !== "NONE" && (
        <div>
          <label className="text-sm font-medium block mb-1">
            {t("animationSpeed")}
          </label>
          <Select
            value={speed}
            onValueChange={(val) => onSpeedChange(val as AnimationSpeed)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectSpeed")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SLOW">{t("speeds.slow")}</SelectItem>
              <SelectItem value="MEDIUM">{t("speeds.medium")}</SelectItem>
              <SelectItem value="FAST">{t("speeds.fast")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
