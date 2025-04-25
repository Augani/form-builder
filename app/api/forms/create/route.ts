import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  Animation,
  AnimationSpeed,
  FieldType,
  FormStatus,
} from "@prisma/client";

function convertFieldType(type: string): FieldType {
  const mapping: Record<string, FieldType> = {
    text: "TEXT",
    email: "EMAIL",
    number: "NUMBER",
    textarea: "TEXTAREA",
    select: "SELECT",
    radio: "RADIO",
    checkbox: "CHECKBOX",
    date: "DATE",
  };

  return mapping[type] as FieldType;
}

const fieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
});

const formSchema = z.object({
  name: z.string().min(3, "Form name must be at least 3 characters"),
  description: z.string().optional(),
  fields: z.array(fieldSchema),
  theme: z.string(),
  animation: z.enum([
    "NONE",
    "FADE",
    "SLIDE",
    "ZOOM",
    "BOUNCE",
    "SCALE",
  ] as const),
  animationSpeed: z.enum(["SLOW", "MEDIUM", "FAST"] as const),
  status: z.string().default("draft"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { success: false, message: "User ID not found in session" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const validatedData = formSchema.parse(body);

    const statusMap: Record<string, FormStatus> = {
      draft: "DRAFT",
      active: "ACTIVE",
      inactive: "INACTIVE",
    };

    const form = await prisma.$transaction(async (tx) => {
      const newForm = await tx.form.create({
        data: {
          name: validatedData.name,
          description: validatedData.description || "",
          themeId: validatedData.theme,
          animation: validatedData.animation as Animation,
          animationSpeed: validatedData.animationSpeed as AnimationSpeed,
          status: statusMap[validatedData.status.toLowerCase()] || "DRAFT",
          userId: session.user.id,
        },
      });

      for (let i = 0; i < validatedData.fields.length; i++) {
        const field = validatedData.fields[i];
        await tx.field.create({
          data: {
            formId: newForm.id,
            type: convertFieldType(field.type),
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            options: field.options || [],
            order: i,
          },
        });
      }

      return newForm;
    });

    return NextResponse.json({
      success: true,
      message: "Form created successfully",
      data: form,
    });
  } catch (error) {
    console.error("Error creating form:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid form data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create form" },
      { status: 500 }
    );
  }
}
