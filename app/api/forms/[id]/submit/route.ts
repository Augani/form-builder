import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address").optional();

const formSubmissionSchema = z.object({
  email: emailSchema,
  responses: z.array(
    z.object({
      fieldId: z.string(),
      value: z.string().or(z.array(z.string())),
    })
  ),
});

interface FormResponse {
  fieldId: string;
  value: string | string[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;

    const form = await prisma.form.findUnique({
      where: {
        id: formId,
        status: "ACTIVE", // Only allow submissions for active forms
      },
      include: {
        fields: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found or not active" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const validationResult = formSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { email, responses } = validationResult.data;

    if (form.collectEmails && !email) {
      return NextResponse.json(
        { error: "Email is required for this form" },
        { status: 400 }
      );
    }

    if (form.limitOneResponsePerUser && email) {
      const existingResponse = await prisma.response.findFirst({
        where: {
          formId,
          email,
        },
      });

      if (existingResponse) {
        return NextResponse.json(
          { error: "You have already submitted a response to this form" },
          { status: 400 }
        );
      }
    }

    const requiredFieldIds = form.fields
      .filter((field) => field.required)
      .map((field) => field.id);

    const submittedFieldIds = responses.map(
      (response: FormResponse) => response.fieldId
    );

    const missingRequiredFields = requiredFieldIds.filter(
      (id) => !submittedFieldIds.includes(id)
    );

    if (missingRequiredFields.length > 0) {
      return NextResponse.json(
        { error: "All required fields must be filled", missingRequiredFields },
        { status: 400 }
      );
    }

    const formResponse = await prisma.$transaction(async (tx) => {
      const newResponse = await tx.response.create({
        data: {
          formId,
          email,
          completed: true,
        },
      });

      for (const response of responses) {
        const { fieldId, value } = response;

        const stringValue = Array.isArray(value) ? value.join(", ") : value;

        await tx.fieldResponse.create({
          data: {
            fieldId,
            responseId: newResponse.id,
            value: stringValue,
          },
        });
      }

      await tx.form.update({
        where: { id: formId },
        data: {
          responseCount: {
            increment: 1,
          },
        },
      });

      return newResponse;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Form submitted successfully",
        responseId: formResponse.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
