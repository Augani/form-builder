import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// Schema for form creation
const createFormSchema = z.object({
  name: z.string().min(3, "Form name must be at least 3 characters"),
  description: z.string().optional(),
  fields: z.array(
    z.object({
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
    })
  ),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]).default("DRAFT"),
  collectEmails: z.boolean().optional().default(false),
  limitOneResponsePerUser: z.boolean().optional().default(false),
  showProgressBar: z.boolean().optional().default(false),
  shuffleQuestions: z.boolean().optional().default(false),
});

type FormInput = z.infer<typeof createFormSchema>;

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Build query
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status && ["DRAFT", "ACTIVE", "INACTIVE"].includes(status)) {
      where.status = status;
    }

    // Get forms with pagination
    const [forms, totalCount] = await Promise.all([
      prisma.form.findMany({
        where: where as Prisma.FormWhereInput,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          responseCount: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.form.count({ where: where as Prisma.FormWhereInput }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      forms,
      pagination: {
        total: totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error getting forms:", error);
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

    // Validate the request body
    const validationResult = createFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { fields, ...formData } = validationResult.data as FormInput;

    // Create the form with fields
    const form = await prisma.form.create({
      data: {
        ...formData,
        userId: session.user.id,
        fields: {
          create: fields.map((field, index) => ({
            type: field.type,
            label: field.label,
            placeholder: field.placeholder || null,
            required: field.required,
            options: field.options || [],
            order: index,
          })),
        },
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
