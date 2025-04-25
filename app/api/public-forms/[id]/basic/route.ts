import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;

    // Get basic form info
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        theme: true,
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Return just the basic form information
    return NextResponse.json(form);
  } catch (error) {
    console.error("Error getting form basic info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
