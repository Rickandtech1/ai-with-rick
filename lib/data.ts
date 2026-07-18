import { siteConfig, type HeroVideo } from "./site-config";
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

/** Hero video card content, managed in /admin. Falls back to site-config. */
export async function getHeroVideo(): Promise<HeroVideo> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "hero_video")
    .maybeSingle();
  const value = data?.value as Partial<HeroVideo> | undefined;
  if (value?.url && value.title) {
    return { url: value.url, title: value.title, caption: value.caption ?? "" };
  }
  return { ...siteConfig.heroVideo };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Look a resource up by UUID or by slug (pretty URL). */
export async function getVisibleResource(idOrSlug: string): Promise<Resource | null> {
  const supabase = await createSupabaseServerClient();
  const column = UUID_RE.test(idOrSlug) ? "id" : "slug";
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq(column, idOrSlug)
    .maybeSingle();
  if (error) return null; // e.g. slug column not migrated yet
  return (data as Resource) ?? null;
}
