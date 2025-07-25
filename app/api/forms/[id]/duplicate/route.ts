import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id: formId } = await params;

    const existingForm = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: session.user.id,
      },
      include: {
        fields: true,
      },
    });

    if (!existingForm) {
      return NextResponse.json(
        { success: false, message: "Form not found" },
        { status: 404 }
      );
    }

    const { fields, ...formDataWithoutFields } = existingForm;

    // Remove id from formDataWithoutFields to avoid unique constraint error
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...formDataWithoutId } = formDataWithoutFields;

    const newForm = await prisma.form.create({
      data: {
        ...formDataWithoutId,
        name: `${formDataWithoutFields.name} (Copy)`,
        status: "DRAFT",
        fields: {
          create: fields.map((field) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, formId, ...fieldData } = field;
            return fieldData;
          }),
        },
      },
      include: {
        fields: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Form duplicated successfully",
      data: newForm,
    });
  } catch (error) {
    console.error("Error duplicating form:", error);
    return NextResponse.json(
      { success: false, message: "Failed to duplicate form" },
      { status: 500 }
    );
  }
}
