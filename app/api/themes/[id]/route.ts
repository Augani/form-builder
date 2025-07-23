import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Animation, FormLayout, FormSpacing } from "@prisma/client";

const themeUpdateSchema = z.object({
  name: z
    .string()
    .min(3, "Theme name must be at least 3 characters")
    .optional(),
  description: z.string().optional(),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  backgroundColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  accentColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  textColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  fontFamily: z.string().optional(),
  isPublic: z.boolean().optional(),
  defaultAnimation: z.nativeEnum(Animation).optional(),
  defaultLayout: z.nativeEnum(FormLayout).optional(),
  defaultSpacing: z.nativeEnum(FormSpacing).optional(),
  borderRadius: z.number().int().min(0).max(32).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: themeId } = await params;

    const theme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    if (
      !theme.isPublic &&
      (!session?.user || theme.userId !== session.user.id)
    ) {
      return NextResponse.json(
        { error: "Unauthorized access to theme" },
        { status: 403 }
      );
    }

    return NextResponse.json(theme);
  } catch (error) {
    console.error("Error fetching theme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: themeId } = await params;
    const body = await req.json();

    const validationResult = themeUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const existingTheme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    if (existingTheme.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this theme" },
        { status: 403 }
      );
    }

    const updatedTheme = await prisma.theme.update({
      where: { id: themeId },
      data: validationResult.data,
    });

    return NextResponse.json(updatedTheme);
  } catch (error) {
    console.error("Error updating theme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: themeId } = await params;

    const existingTheme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    if (existingTheme.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this theme" },
        { status: 403 }
      );
    }

    const formCount = await prisma.form.count({
      where: { themeId },
    });

    if (formCount > 0) {
      return NextResponse.json(
        {
          error:
            "This theme is currently in use by forms. Update the forms to use another theme before deleting.",
        },
        { status: 409 }
      );
    }

    await prisma.theme.delete({
      where: { id: themeId },
    });

    return NextResponse.json({ success: "Theme deleted successfully" });
  } catch (error) {
    console.error("Error deleting theme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
