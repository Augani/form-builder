import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validate email if provided
const emailSchema = z.string().email("Invalid email address").optional();

// Schema for form submission
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

    // Check if the form exists and is active
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

    // Validate submission data
    const validationResult = formSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { email, responses } = validationResult.data;

    // Check if email is required but not provided
    if (form.collectEmails && !email) {
      return NextResponse.json(
        { error: "Email is required for this form" },
        { status: 400 }
      );
    }

    // Check if one response per user is enabled and user has already responded
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

    // Validate that all required fields are answered
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

    // Create the response with field responses
    const formResponse = await prisma.$transaction(async (tx) => {
      // Create the response
      const newResponse = await tx.response.create({
        data: {
          formId,
          email,
          completed: true,
        },
      });

      // Create field responses
      for (const response of responses) {
        const { fieldId, value } = response;

        // Convert array values to comma-separated string
        const stringValue = Array.isArray(value) ? value.join(", ") : value;

        await tx.fieldResponse.create({
          data: {
            fieldId,
            responseId: newResponse.id,
            value: stringValue,
          },
        });
      }

      // Increment the form's response count
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
