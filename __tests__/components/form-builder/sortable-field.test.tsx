import { render, screen, fireEvent } from "@testing-library/react";
import { SortableField } from "@/components/form-builder/sortable-field";
import { DndContext } from "@dnd-kit/core";

jest.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("SortableField", () => {
  const mockField = {
    id: "test-field-1",
    type: "text",
    label: "Test Field",
    required: false,
  };

  const mockCallbacks = {
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onAddOption: jest.fn(),
    onUpdateOption: jest.fn(),
    onRemoveOption: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders field with correct initial values", () => {
    render(
      <DndContext>
        <SortableField field={mockField} index={0} {...mockCallbacks} />
      </DndContext>
    );

    expect(screen.getByLabelText("label")).toHaveValue("Test Field");

    expect(screen.getByText("text")).toBeInTheDocument();
  });

  it("calls onUpdate when label is changed and blurred", () => {
    render(
      <DndContext>
        <SortableField field={mockField} index={0} {...mockCallbacks} />
      </DndContext>
    );

    const labelInput = screen.getByLabelText("label");
    fireEvent.change(labelInput, { target: { value: "New Label" } });
    fireEvent.blur(labelInput);

    expect(mockCallbacks.onUpdate).toHaveBeenCalledWith("test-field-1", {
      label: "New Label",
    });
  });

  it("calls onUpdate when field type is changed", () => {
    render(
      <DndContext>
        <SortableField field={mockField} index={0} {...mockCallbacks} />
      </DndContext>
    );

    const typeSelect = screen.getByLabelText("type");
    fireEvent.click(typeSelect);

    const emailOption = screen.getByText("email");
    fireEvent.click(emailOption);

    expect(mockCallbacks.onUpdate).toHaveBeenCalledWith("test-field-1", {
      type: "email",
    });
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <DndContext>
        <SortableField field={mockField} index={0} {...mockCallbacks} />
      </DndContext>
    );

    const deleteButton = screen.getByTitle("remove");
    fireEvent.click(deleteButton);

    expect(mockCallbacks.onDelete).toHaveBeenCalledWith("test-field-1");
  });

  it("shows placeholder input for text-based fields", () => {
    render(
      <DndContext>
        <SortableField field={mockField} index={0} {...mockCallbacks} />
      </DndContext>
    );

    expect(screen.getByLabelText("placeholder")).toBeInTheDocument();
  });

  it("shows options management for select/radio/checkbox fields", () => {
    const selectField = {
      ...mockField,
      type: "select",
      options: ["Option 1"],
    };

    render(
      <DndContext>
        <SortableField field={selectField} index={0} {...mockCallbacks} />
      </DndContext>
    );

    expect(screen.getByText("options")).toBeInTheDocument();
    expect(screen.getByText("addOption")).toBeInTheDocument();
  });

  it("calls onAddOption when add option button is clicked", () => {
    const selectField = {
      ...mockField,
      type: "select",
      options: ["Option 1"],
    };

    render(
      <DndContext>
        <SortableField field={selectField} index={0} {...mockCallbacks} />
      </DndContext>
    );

    const addButton = screen.getByText("addOption");
    fireEvent.click(addButton);

    expect(mockCallbacks.onAddOption).toHaveBeenCalledWith("test-field-1");
  });
});
