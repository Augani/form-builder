import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params;

    const form = await prisma.form.findUnique({
      where: {
        id: formId,
        status: "ACTIVE", // Only return active forms
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
        theme: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found or not available" },
        { status: 404 }
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error getting public form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
