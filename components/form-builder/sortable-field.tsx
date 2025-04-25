import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

type FieldType = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  _action?: "create" | "update" | "delete";
};

interface SortableFieldProps {
  field: FieldType;
  index?: number;
  onUpdate?: (fieldId: string, updates: Partial<FieldType>) => void;
  onDelete?: (fieldId: string) => void;
  onAddOption?: (fieldId: string) => void;
  onUpdateOption?: (
    fieldId: string,
    optionIndex: number,
    value: string
  ) => void;
  onRemoveOption?: (fieldId: string, optionIndex: number) => void;
}

export function SortableField({
  field,
  index = 0,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: SortableFieldProps) {
  const fieldT = useTranslations("dashboard.formBuilder.field");
  const fieldTypesT = useTranslations("dashboard.formBuilder.fieldTypes");
  const [label, setLabel] = useState(field.label);

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
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
  };

  const handleLabelBlur = () => {
    if (onUpdate && label !== field.label) {
      onUpdate(field.id, { label });
    }
  };

  const handleRequiredChange = (checked: boolean) => {
    if (onUpdate) {
      onUpdate(field.id, { required: checked });
    }
  };

  const handleTypeChange = (value: string) => {
    if (onUpdate) {
      const updates: Partial<FieldType> = { type: value };

      if (["select", "radio", "checkbox"].includes(value) && !field.options) {
        updates.options = [""];
      }

      onUpdate(field.id, updates);
    }
  };

  const handlePlaceholderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onUpdate) {
      onUpdate(field.id, { placeholder: e.target.value });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded-md relative"
    >
      {/* Field header with drag handle and delete button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            {...attributes}
            {...listeners}
            className="mr-2 cursor-move text-muted-foreground"
            title={fieldT("dragHandle")}
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <h3 className="font-medium">
            {fieldT("header", { index: index + 1 })}
          </h3>
        </div>
        {/* Always show the delete button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            console.log("Delete button clicked for field ID:", field.id);
            if (onDelete) {
              onDelete(field.id);
            }
          }}
          className="text-destructive hover:text-destructive"
          title={fieldT("remove")}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      {/* Field configuration options */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Field Label */}
          <div>
            <Label htmlFor={`field-${field.id}-label`}>{fieldT("label")}</Label>
            <Input
              id={`field-${field.id}-label`}
              value={label}
              placeholder={fieldT("labelPlaceholder")}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              className="mt-1"
            />
          </div>

          {/* Field Type */}
          <div>
            <Label htmlFor={`field-${field.id}-type`}>{fieldT("type")}</Label>
            <Select value={field.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="mt-1" id={`field-${field.id}-type`}>
                <SelectValue placeholder={fieldT("typePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">{fieldTypesT("text")}</SelectItem>
                <SelectItem value="email">{fieldTypesT("email")}</SelectItem>
                <SelectItem value="number">{fieldTypesT("number")}</SelectItem>
                <SelectItem value="textarea">
                  {fieldTypesT("textarea")}
                </SelectItem>
                <SelectItem value="select">{fieldTypesT("select")}</SelectItem>
                <SelectItem value="radio">{fieldTypesT("radio")}</SelectItem>
                <SelectItem value="checkbox">
                  {fieldTypesT("checkbox")}
                </SelectItem>
                <SelectItem value="date">{fieldTypesT("date")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Placeholder for text-based fields */}
        {(field.type === "text" ||
          field.type === "email" ||
          field.type === "number" ||
          field.type === "textarea") && (
          <div>
            <Label htmlFor={`field-${field.id}-placeholder`}>
              {fieldT("placeholder")}
            </Label>
            <Input
              id={`field-${field.id}-placeholder`}
              value={field.placeholder || ""}
              onChange={handlePlaceholderChange}
              placeholder={fieldT("placeholderPlaceholder")}
              className="mt-1"
            />
          </div>
        )}

        {/* Options for select, radio, and checkbox types */}
        {(field.type === "select" ||
          field.type === "radio" ||
          field.type === "checkbox") &&
          onAddOption &&
          onUpdateOption &&
          onRemoveOption && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{fieldT("options")}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddOption(field.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {fieldT("addOption")}
                </Button>
              </div>
              <div className="space-y-2">
                {field.options?.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center space-x-2"
                  >
                    <Input
                      value={option}
                      onChange={(e) =>
                        onUpdateOption(field.id, optionIndex, e.target.value)
                      }
                      placeholder={fieldT("optionPlaceholder", {
                        index: optionIndex + 1,
                      })}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveOption(field.id, optionIndex)}
                      disabled={(field.options?.length || 0) <= 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Required field toggle */}
        <div className="flex items-center space-x-2 pt-2">
          <Switch
            id={`field-${field.id}-required`}
            checked={field.required}
            onCheckedChange={handleRequiredChange}
          />
          <Label
            htmlFor={`field-${field.id}-required`}
            className="cursor-pointer"
          >
            {fieldT("required")}
          </Label>
        </div>
      </div>
    </div>
  );
}
