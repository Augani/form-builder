import { render, screen } from "@testing-library/react";
import { FormPreview } from "@/components/preview";
import { Animation, FormLayout, FormSpacing } from "@prisma/client";
import { ReactNode, HTMLAttributes } from "react";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("FormPreview", () => {
  const mockFields = [
    {
      id: "field-1",
      type: "text",
      label: "Text Field",
      required: true,
      placeholder: "Enter text",
    },
    {
      id: "field-2",
      type: "select",
      label: "Select Field",
      required: false,
      options: ["Option 1", "Option 2"],
    },
  ];

  const mockTheme = {
    id: "theme-1",
    name: "Test Theme",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    backgroundColor: "#f0f0f0",
    accentColor: "#cccccc",
    textColor: "#333333",
    fontFamily: "Arial",
    defaultAnimation: Animation.NONE,
    defaultLayout: FormLayout.STANDARD,
    defaultSpacing: FormSpacing.MEDIUM,
    borderRadius: 8,
  };

  it("renders form with correct title and description", () => {
    render(
      <FormPreview
        formName="Test Form"
        formDescription="Test Description"
        fields={mockFields}
      />
    );

    expect(screen.getByText("Test Form")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    render(<FormPreview formName="Test Form" fields={mockFields} />);

    expect(screen.getByText("Text Field")).toBeInTheDocument();
    expect(screen.getByText("Select Field")).toBeInTheDocument();
  });

  it("applies theme styles when theme is provided", () => {
    render(
      <FormPreview formName="Test Form" fields={mockFields} theme={mockTheme} />
    );

    const formElement = screen.getByText("Test Form").closest(".bg-card");
    expect(formElement).toHaveStyle({
      backgroundColor: "#f0f0f0",
      color: "#333333",
      fontFamily: "Arial",
    });
  });

  it("shows progress bar when showProgressBar is true", () => {
    render(
      <FormPreview
        formName="Test Form"
        fields={mockFields}
        showProgressBar={true}
      />
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("does not show progress bar when showProgressBar is false", () => {
    render(
      <FormPreview
        formName="Test Form"
        fields={mockFields}
        showProgressBar={false}
      />
    );

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("renders different field types correctly", () => {
    const fieldsWithAllTypes = [
      ...mockFields,
      {
        id: "field-3",
        type: "textarea",
        label: "Textarea Field",
        required: true,
      },
      {
        id: "field-4",
        type: "radio",
        label: "Radio Field",
        required: false,
        options: ["Option A", "Option B"],
      },
      {
        id: "field-5",
        type: "checkbox",
        label: "Checkbox Field",
        required: false,
        options: ["Check 1", "Check 2"],
      },
    ];

    render(<FormPreview formName="Test Form" fields={fieldsWithAllTypes} />);

    expect(screen.getByText("Text Field")).toBeInTheDocument();
    expect(screen.getByText("Select Field")).toBeInTheDocument();
    expect(screen.getByText("Textarea Field")).toBeInTheDocument();
    expect(screen.getByText("Radio Field")).toBeInTheDocument();
    expect(screen.getByText("Checkbox Field")).toBeInTheDocument();
  });

  it("shows required field indicators", () => {
    render(<FormPreview formName="Test Form" fields={mockFields} />);

    const fieldLabels = screen.getAllByText(/Text Field/);
    const fieldLabel = fieldLabels[0];
    expect(fieldLabel).toBeInTheDocument();

    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
