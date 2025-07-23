import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
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

    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        userId: session.user.id,
      },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form not found" },
        { status: 404 }
      );
    }

    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: { status: "ACTIVE" },
    });

    return NextResponse.json({
      success: true,
      message: "Form published successfully",
      data: updatedForm,
    });
  } catch (error) {
    console.error("Error publishing form:", error);
    return NextResponse.json(
      { success: false, message: "Failed to publish form" },
      { status: 500 }
    );
  }
}
