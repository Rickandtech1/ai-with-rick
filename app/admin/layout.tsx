import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  async function doSignOut() {
    "use server";
    await signOut();
    redirect("/login");
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <Link href="/admin" className="wordmark">
          {siteConfig.name} · Admin
        </Link>
        <nav className="admin-nav">
          <Link href="/admin">Resources</Link>
          <Link href="/admin/hero">Hero video</Link>
          <Link href="/admin/newsletter">Newsletter</Link>
          <Link href="/admin/audience">Audience</Link>
          <Link href="/" target="_blank">
            View site ↗
          </Link>
          <form action={doSignOut}>
            <button type="submit">Sign out</button>
          </form>
        </nav>
      </div>
      {children}
    </div>
  );
}
