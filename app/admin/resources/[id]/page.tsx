import { notFound } from "next/navigation";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Resource } from "@/lib/types";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await supabaseAdmin().from("resources").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <>
      <div className="admin-topbar">
        <h1 className="admin-h1">Edit resource</h1>
      </div>
      <div className="admin-panel">
        <ResourceForm resource={data as Resource} />
      </div>
    </>
  );
}
