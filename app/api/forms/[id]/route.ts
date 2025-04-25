import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for form update
const updateFormSchema = z.object({
  name: z.string().min(3, "Form name must be at least 3 characters").optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).optional(),
  collectEmails: z.boolean().optional(),
  limitOneResponsePerUser: z.boolean().optional(),
  showProgressBar: z.boolean().optional(),
  shuffleQuestions: z.boolean().optional(),
  themeId: z.string().nullable().optional(),
  animation: z
    .enum(["NONE", "FADE", "SLIDE", "ZOOM", "BOUNCE", "SCALE"])
    .optional(),
  animationSpeed: z.enum(["SLOW", "MEDIUM", "FAST"]).optional(),
  fields: z
    .array(
      z.object({
        id: z.string().optional(), // Existing field ID (if updating)
        type: z.enum([
          "TEXT",
          "EMAIL",
          "NUMBER",
          "TEXTAREA",
          "SELECT",
          "RADIO",
          "CHECKBOX",
          "DATE",
        ]),
        label: z.string().min(1, "Field label is required"),
        placeholder: z.string().optional(),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional(),
        order: z.number().optional(),
        _action: z.enum(["create", "update", "delete"]).optional(), // Action to take
      })
    )
    .optional(),
});

type FormUpdateInput = z.infer<typeof updateFormSchema>;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formId = params.id;

    // Get the form with fields
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
        userId: session.user.id, // Ensure the form belongs to the authenticated user
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
        responses: true,
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error getting form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formId = params.id;

    // Check if form exists and belongs to the user
    const existingForm = await prisma.form.findUnique({
      where: {
        id: formId,
        userId: session.user.id,
      },
      include: {
        fields: true,
      },
    });

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const body = await req.json();

    // Validate the request body
    const validationResult = updateFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { fields, ...formData } = validationResult.data as FormUpdateInput;

    // Create a transaction to update both form and fields
    const updatedForm = await prisma.$transaction(async (tx) => {
      // Update form data
      await tx.form.update({
        where: { id: formId },
        data: formData,
      });

      // Handle field operations if fields were provided
      if (fields && fields.length > 0) {
        // Process field operations (create, update, delete)
        for (const field of fields) {
          const { _action, id: fieldId, ...fieldData } = field;

          if (_action === "delete" && fieldId) {
            // Delete existing field
            await tx.field.delete({
              where: { id: fieldId },
            });
          } else if (_action === "update" && fieldId) {
            // Update existing field
            await tx.field.update({
              where: { id: fieldId },
              data: fieldData,
            });
          } else if (_action === "create" || !_action) {
            // Create new field
            await tx.field.create({
              data: {
                ...fieldData,
                formId,
                order: fieldData.order || 0,
              },
            });
          }
        }
      }

      // Fetch updated form with fields
      return tx.form.findUnique({
        where: { id: formId },
        include: {
          fields: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formId = params.id;

    // Check if form exists and belongs to the user
    const existingForm = await prisma.form.findUnique({
      where: {
        id: formId,
        userId: session.user.id,
      },
    });

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Delete the form (cascading delete will handle fields)
    await prisma.form.delete({
      where: {
        id: formId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
