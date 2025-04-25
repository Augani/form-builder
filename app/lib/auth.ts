import { auth } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// Use this function in server components to get the current session
export async function getSession() {
  return await auth();
}

// Use this function in server components to protect a page
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  return session.user;
}

// Use this function for protected pages
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
