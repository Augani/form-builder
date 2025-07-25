import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: formId } = await params;

    const form = await prisma.form.findUnique({
      where: {
        id: formId,
        userId: session.user.id,
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const [responses, totalCount] = await Promise.all([
      prisma.response.findMany({
        where: {
          formId,
        },
        include: {
          fields: {
            include: {
              field: {
                select: {
                  id: true,
                  label: true,
                  type: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.response.count({
        where: {
          formId,
        },
      }),
    ]);

    const formattedResponses = responses.map((response) => {
      const fieldValues: Record<
        string,
        { value: string | string[]; type: string; fieldId: string }
      > = {};

      response.fields.forEach((fieldResponse) => {
        fieldValues[fieldResponse.field.label] = {
          value: fieldResponse.value,
          type: fieldResponse.field.type,
          fieldId: fieldResponse.field.id,
        };
      });

      return {
        id: response.id,
        email: response.email,
        createdAt: response.createdAt,
        completed: response.completed,
        fields: fieldValues,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      responses: formattedResponses,
      pagination: {
        total: totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error getting form responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
