import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //    get all public themes
    const publicThemes = await prisma.theme.findMany({
      where: { isPublic: true },
    });

    // get all user themes
    const userThemes = await prisma.theme.findMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      themes: [...publicThemes, ...userThemes],
    });
  } catch (error) {
    console.error("Error getting themes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
