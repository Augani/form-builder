"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Save,
  Trash,
  GripVertical,
  Eye,
  Palette,
  Play,
  Keyboard,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Animation,
  FormLayout,
  FormSpacing,
  AnimationSpeed,
} from "@prisma/client";
import apiClient from "@/lib/axios";
import { FormPreview } from "@/components/preview";

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

function SortableField({
  field,
  index,
  removeField,
  updateField,
  addOption,
  updateOption,
  removeOption,
  isLoading,
}: {
  field: FieldType;
  index: number;
  removeField: (id: string) => void;
  updateField: (id: string, updates: Partial<FieldType>) => void;
  addOption: (fieldId: string) => void;
  updateOption: (fieldId: string, optionIndex: number, value: string) => void;
  removeOption: (fieldId: string, optionIndex: number) => void;
  isLoading: boolean;
}) {
  const t = useTranslations("dashboard.formBuilder");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-md relative"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            {...attributes}
            {...listeners}
            className="mr-2 cursor-move text-muted-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <h3 className="font-medium">
            {t("field")} {index + 1}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeField(field.id)}
            disabled={isLoading}
            className="text-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t("fieldLabel")}</label>
            <Input
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              placeholder={t("fieldLabelPlaceholder")}
              className="mt-1"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("fieldType")}</label>
            <Select
              value={field.type}
              onValueChange={(value) => {
                const updates: Partial<FieldType> = {
                  type: value,
                };

                if (
                  ["select", "radio", "checkbox"].includes(value) &&
                  !field.options
                ) {
                  updates.options = [""];
                }

                updateField(field.id, updates);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t("selectFieldType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">{t("fieldTypes.text")}</SelectItem>
                <SelectItem value="email">{t("fieldTypes.email")}</SelectItem>
                <SelectItem value="number">{t("fieldTypes.number")}</SelectItem>
                <SelectItem value="textarea">
                  {t("fieldTypes.textarea")}
                </SelectItem>
                <SelectItem value="select">{t("fieldTypes.select")}</SelectItem>
                <SelectItem value="radio">{t("fieldTypes.radio")}</SelectItem>
                <SelectItem value="checkbox">
                  {t("fieldTypes.checkbox")}
                </SelectItem>
                <SelectItem value="date">{t("fieldTypes.date")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(field.type === "text" ||
          field.type === "email" ||
          field.type === "number" ||
          field.type === "textarea") && (
          <div>
            <label className="text-sm font-medium">{t("placeholder")}</label>
            <Input
              value={field.placeholder || ""}
              onChange={(e) =>
                updateField(field.id, {
                  placeholder: e.target.value,
                })
              }
              placeholder={t("placeholderPlaceholder")}
              className="mt-1"
              disabled={isLoading}
            />
          </div>
        )}

        {(field.type === "select" ||
          field.type === "radio" ||
          field.type === "checkbox") && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("options")}</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addOption(field.id)}
                disabled={isLoading}
              >
                <Plus className="h-3 w-3 mr-1" />
                {t("addOption")}
              </Button>
            </div>
            <div className="space-y-2">
              {field.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) =>
                      updateOption(field.id, optionIndex, e.target.value)
                    }
                    placeholder={`${t("option")} ${optionIndex + 1}`}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(field.id, optionIndex)}
                    disabled={(field.options?.length || 0) <= 1 || isLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 pt-2">
          <Switch
            checked={field.required}
            onCheckedChange={(checked) =>
              updateField(field.id, { required: checked })
            }
            disabled={isLoading}
            id={`required-${field.id}`}
          />
          <label
            htmlFor={`required-${field.id}`}
            className="text-sm font-medium cursor-pointer"
          >
            {t("required")}
          </label>
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

    console.log(`Updating ${property} to ${value}`);

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
    <div className="space-y-4">
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

export default function NewFormPage() {
  const t = useTranslations("dashboard.formBuilder");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FieldType[]>([
    {
      id: "field_" + Date.now(),
      type: "text",
      label: "",
      placeholder: "",
      required: false,
    },
  ]);
  const formFieldsContainerRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeType | undefined>(
    undefined
  );
  const [selectedAnimation, setSelectedAnimation] = useState<Animation>("NONE");
  const [animationSpeed, setAnimationSpeed] =
    useState<AnimationSpeed>("MEDIUM");
  const [showAnimationPreview, setShowAnimationPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");

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
    name: z.string().min(3, t("nameRequired")),
    description: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  const scrollToBottom = useCallback(() => {
    if (formFieldsContainerRef.current) {
      formFieldsContainerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const addField = useCallback(() => {
    setFormFields([
      ...formFields,
      {
        id: "field_" + Date.now(),
        type: "text",
        label: "",
        placeholder: "",
        required: false,
      },
    ]);
  }, [formFields]);

  const removeField = (id: string) => {
    if (formFields.length > 1) {
      setFormFields(formFields.filter((field) => field.id !== id));
    } else {
      toast.error(t("cannotRemoveLastField"));
    }
  };

  const updateField = (id: string, updates: Partial<FieldType>) => {
    setFormFields(
      formFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormFields((fields) => {
        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over.id);

        return arrayMove(fields, oldIndex, newIndex);
      });
    }
  };

  const addOption = (fieldId: string) => {
    setFormFields(
      formFields.map((field) => {
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

  const updateOption = (
    fieldId: string,
    optionIndex: number,
    value: string
  ) => {
    setFormFields(
      formFields.map((field) => {
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

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFormFields(
      formFields.map((field) => {
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

  useEffect(() => {
    if (selectedTheme && selectedAnimation === "NONE") {
      setSelectedAnimation(selectedTheme.defaultAnimation);
    }
  }, [selectedTheme, selectedAnimation]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    const hasEmptyLabels = formFields.some((field) => !field.label.trim());
    if (hasEmptyLabels) {
      toast.error(t("allFieldsNeedLabels"));
      setIsLoading(false);
      return;
    }

    try {
      const formData = {
        name: values.name,
        description: values.description || "",
        fields: formFields,
        theme: selectedTheme?.id || "default-light",
        animation: selectedAnimation,
        animationSpeed: animationSpeed,
        status: "draft",
      };

      const { data: result } = await apiClient.post(
        "/api/forms/create",
        formData
      );

      if (result.success) {
        toast.success(`${t("formCreated")}: ${result.data.name}`);
        router.push(`/dashboard/forms/${result.data.id}`);
      } else {
        console.error("API error:", result);
        toast.error(result.message || t("errorCreatingForm"));
      }
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error(t("errorCreatingForm"));
    } finally {
      setIsLoading(false);
    }
  };

  const triggerAnimationPreview = () => {
    setShowAnimationPreview(false);
    setTimeout(() => {
      setShowAnimationPreview(true);
      setActiveTab("preview");
    }, 100);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.altKey || event.metaKey) && event.key === "m") {
        event.preventDefault(); // Prevent default browser behavior
        addField();
        scrollToBottom();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [addField, scrollToBottom]);

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("hasSeenAddFieldTooltip");

    if (!hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);

        const hideTimer = setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem("hasSeenAddFieldTooltip", "true");
        }, 5000);

        return () => clearTimeout(hideTimer);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem("hasSeenAddFieldTooltip", "true");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between sticky py-6 z-10 top-0 bg-background">
        <h1 className="text-2xl font-bold">{t("createNewForm")}</h1>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading || !form.formState.isValid}
        >
          <Save className="mr-2 h-4 w-4" />
          {t("saveForm")}
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("formName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("formNamePlaceholder")}
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("formDescription")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("formDescriptionPlaceholder")}
                            className="resize-none h-24"
                            {...field}
                            disabled={isLoading}
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
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center">
                  <Keyboard className="h-3 w-3 mr-1" />
                  {/Mac/i.test(navigator.userAgent) ? "⌘M" : "Alt+M"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    addField();
                    scrollToBottom();
                  }}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("addField")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formFields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-6">
                    {formFields.map((field, index) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        index={index}
                        removeField={removeField}
                        updateField={updateField}
                        addOption={addOption}
                        updateOption={updateOption}
                        removeOption={removeOption}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
                    <Select defaultValue="draft" disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">
                          {t("status.draft")}
                        </SelectItem>
                        <SelectItem value="active">
                          {t("status.active")}
                        </SelectItem>
                        <SelectItem value="inactive">
                          {t("status.inactive")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="collect-email" disabled={isLoading} />
                    <label
                      htmlFor="collect-email"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t("collectEmailAddresses")}
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="one-response" disabled={isLoading} />
                    <label
                      htmlFor="one-response"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t("limitOneResponsePerPerson")}
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="show-progress" disabled={isLoading} />
                    <label
                      htmlFor="show-progress"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t("showProgressBar")}
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="shuffle-questions" disabled={isLoading} />
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

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">
                        {t("formAnimation")}
                      </h3>
                      <AnimationSelector
                        value={selectedAnimation}
                        onChange={setSelectedAnimation}
                        speed={animationSpeed}
                        onSpeedChange={setAnimationSpeed}
                        onPreview={triggerAnimationPreview}
                      />
                    </div>
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
                    formName={form.watch("name")}
                    formDescription={form.watch("description")}
                    fields={formFields}
                    theme={selectedTheme}
                    animation={selectedAnimation}
                    animationSpeed={animationSpeed}
                    showAnimationPreview={showAnimationPreview}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Fixed floating button for adding fields */}
          <div className="fixed md:hidden bottom-20 right-2 z-50">
            <TooltipProvider>
              <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      addField();
                      dismissTooltip();
                      scrollToBottom();
                    }}
                    disabled={isLoading}
                    size="lg"
                    className="rounded-full shadow-xl h-8 w-8 p-0"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">{t("addField")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-primary text-primary-foreground p-3 text-sm max-w-[200px] text-center"
                  side="left"
                  sideOffset={16}
                >
                  {t("clickToAddField")}
                  <div className="mt-1 text-xs opacity-80 flex items-center justify-center">
                    <Keyboard className="h-3 w-3 mr-1" />
                    <span>
                      Or press{" "}
                      {/Mac/i.test(navigator.userAgent) ? "⌘M" : "Alt+M"}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary-foreground bg-primary/20 hover:bg-primary/30"
                      onClick={dismissTooltip}
                    >
                      {t("gotIt")}
                    </Button>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
