import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const formId = params.id;

    // Check if the form exists and belongs to the user
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

    // Create a new form with the same data but set status to draft
    // Using rest/spread to omit specific fields
    const { fields, ...formDataWithoutFields } = existingForm;

    const newForm = await prisma.form.create({
      data: {
        ...formDataWithoutFields,
        name: `${formDataWithoutFields.name} (Copy)`,
        status: "DRAFT",
        fields: {
          // Excluding id and formId as they'll be auto-generated
          create: fields.map((field) => {
            // Extract only the fields we want to copy, excluding id and formId
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
