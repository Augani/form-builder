import {
  PrismaClient,
  Animation,
  FormLayout,
  FormSpacing,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const systemUser = await prisma.user.upsert({
    where: { email: "system@snapform.com" },
    update: {},
    create: {
      email: "system@snapform.com",
      name: "System",
      password: "", // No password for system user
    },
  });

  console.log(`Created system user with ID: ${systemUser.id}`);

  const systemThemes = [
    {
      name: "Default",
      description: "A clean, professional theme with a blue accent",
      primaryColor: "#0070f3",
      secondaryColor: "#0070f3",
      backgroundColor: "#ffffff",
      accentColor: "#0070f3",
      textColor: "#333333",
      fontFamily: "Inter, sans-serif",
      isPublic: true,
      defaultAnimation: Animation.FADE,
      defaultLayout: FormLayout.STANDARD,
      defaultSpacing: FormSpacing.MEDIUM,
      borderRadius: 8,
    },
    {
      name: "Dark Mode",
      description: "A sleek dark theme that reduces eye strain",
      primaryColor: "#7c3aed",
      secondaryColor: "#4c1d95",
      backgroundColor: "#1f2937",
      accentColor: "#8b5cf6",
      textColor: "#f9fafb",
      fontFamily: "Inter, sans-serif",
      isPublic: true,
      defaultAnimation: Animation.FADE,
      defaultLayout: FormLayout.STANDARD,
      defaultSpacing: FormSpacing.MEDIUM,
      borderRadius: 8,
    },
    {
      name: "Vibrant",
      description: "A bold, colorful theme with vibrant accents",
      primaryColor: "#f43f5e",
      secondaryColor: "#db2777",
      backgroundColor: "#fffbeb",
      accentColor: "#fb923c",
      textColor: "#1e293b",
      fontFamily: "Poppins, sans-serif",
      isPublic: true,
      defaultAnimation: Animation.SLIDE,
      defaultLayout: FormLayout.CARD,
      defaultSpacing: FormSpacing.MEDIUM,
      borderRadius: 12,
    },
    {
      name: "Minimal",
      description: "A minimalist theme with subtle design elements",
      primaryColor: "#475569",
      secondaryColor: "#334155",
      backgroundColor: "#f8fafc",
      accentColor: "#94a3b8",
      textColor: "#1e293b",
      fontFamily: "DM Sans, sans-serif",
      isPublic: true,
      defaultAnimation: Animation.NONE,
      defaultLayout: FormLayout.STANDARD,
      defaultSpacing: FormSpacing.TIGHT,
      borderRadius: 4,
    },
    {
      name: "Nature",
      description: "A calming theme inspired by natural elements",
      primaryColor: "#059669",
      secondaryColor: "#047857",
      backgroundColor: "#f0fdf4",
      accentColor: "#10b981",
      textColor: "#1e293b",
      fontFamily: "Source Sans Pro, sans-serif",
      isPublic: true,
      defaultAnimation: Animation.FADE,
      defaultLayout: FormLayout.STANDARD,
      defaultSpacing: FormSpacing.WIDE,
      borderRadius: 8,
    },
    {
      name: "Corporate",
      description: "A professional theme ideal for business forms",
      primaryColor: "#1e40af",
      secondaryColor: "#1e3a8a",
      backgroundColor: "#ffffff",
      accentColor: "#3b82f6",
      textColor: "#0f172a",
      fontFamily: "Roboto, sans-serif",
      isPublic: true,
      defaultAnimation: Animation.FADE,
      defaultLayout: FormLayout.STANDARD,
      defaultSpacing: FormSpacing.MEDIUM,
      borderRadius: 4,
    },
    {
      name: "Playful",
      description: "A fun, engaging theme with playful animations",
      primaryColor: "#6d28d9",
      secondaryColor: "#5b21b6",
      backgroundColor: "#f5f3ff",
      accentColor: "#a78bfa",
      textColor: "#4b5563",
      fontFamily: "Nunito, sans-serif",
      isPublic: true,
      defaultAnimation: Animation.BOUNCE,
      defaultLayout: FormLayout.CONVERSATIONAL,
      defaultSpacing: FormSpacing.MEDIUM,
      borderRadius: 16,
    },
    {
      name: "Modern",
      description: "A contemporary theme with clean lines and bold accents",
      primaryColor: "#06b6d4",
      secondaryColor: "#0e7490",
      backgroundColor: "#ecfeff",
      accentColor: "#22d3ee",
      textColor: "#0f172a",
      fontFamily: "Montserrat, sans-serif",
      isPublic: true,
      defaultAnimation: Animation.SLIDE,
      defaultLayout: FormLayout.CARD,
      defaultSpacing: FormSpacing.MEDIUM,
      borderRadius: 8,
    },
  ];

  for (const theme of systemThemes) {
    const themeId = `system_${theme.name.toLowerCase().replace(/\s+/g, "_")}`;

    const existingTheme = await prisma.theme.findUnique({
      where: { id: themeId },
    });

    if (existingTheme) {
      await prisma.theme.update({
        where: { id: themeId },
        data: theme,
      });
    } else {
      await prisma.theme.create({
        data: {
          id: themeId,
          ...theme,
          userId: systemUser.id,
        },
      });
    }

    console.log(`Seeded theme: ${theme.name}`);
  }

  console.log("Seeding completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
