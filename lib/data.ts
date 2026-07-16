import { createSupabaseServerClient } from "./supabase/server";
import type { Resource } from "./types";

/**
 * Public reads go through the anon client so RLS is the enforcement
 * layer: only `visible = true` rows ever leave the database.
 */
export async function getVisibleResources(): Promise<Resource[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("featured", { ascending: false })
    .order("published_date", { ascending: false });
  if (error) {
    console.error("[data] failed to load resources", error);
    return [];
  }
  return (data as Resource[]) ?? [];
}

export async function getVisibleResource(id: string): Promise<Resource | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("resources").select("*").eq("id", id).maybeSingle();
  return (data as Resource) ?? null;
}
