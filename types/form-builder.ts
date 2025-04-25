export type ThemeType = "light" | "dark" | "system";
export type AnimationType = "none" | "fade" | "slide";
export type AnimationSpeed = "slow" | "medium" | "fast";

export type FieldType = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  _action?: "create" | "update" | "delete";
};
