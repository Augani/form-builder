import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
