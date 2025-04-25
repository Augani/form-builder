import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Animation, FormLayout, FormSpacing } from "@prisma/client";

const themeSchema = z.object({
  name: z.string().min(3, "Theme name must be at least 3 characters"),
  description: z.string().optional(),
  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  secondaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  backgroundColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  accentColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  textColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  fontFamily: z.string(),
  isPublic: z.boolean().default(false),
  defaultAnimation: z.nativeEnum(Animation).default("FADE"),
  defaultLayout: z.nativeEnum(FormLayout).default("STANDARD"),
  defaultSpacing: z.nativeEnum(FormSpacing).default("MEDIUM"),
  borderRadius: z.number().int().min(0).max(32).default(8),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const includePublic = searchParams.get("includePublic") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where = includePublic
      ? {
          OR: [{ userId: session.user.id }, { isPublic: true }],
        }
      : { userId: session.user.id };

    const [themes, totalCount] = await Promise.all([
      prisma.theme.findMany({
        where,
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.theme.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      themes,
      pagination: {
        total: totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error getting themes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const validationResult = themeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const themeData = validationResult.data;

    const theme = await prisma.theme.create({
      data: {
        ...themeData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(theme, { status: 201 });
  } catch (error) {
    console.error("Error creating theme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
