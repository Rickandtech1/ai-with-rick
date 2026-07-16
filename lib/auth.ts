import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

/**
 * The single admin is whoever ADMIN_EMAIL names. Even if Supabase
 * signups were left open, other accounts can never reach /admin.
 */
export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  if (!user || !adminEmail || user.email?.toLowerCase() !== adminEmail) return null;
  return user;
}

/** For pages/layouts: bounce non-admins to /login. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  return user;
}

/** For server actions: fail loudly instead of redirecting. */
export async function requireAdminAction() {
  const user = await getAdminUser();
  if (!user) throw new Error("Not authorized.");
  return user;
}
