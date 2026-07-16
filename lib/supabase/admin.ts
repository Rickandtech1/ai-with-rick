import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Service-role client — bypasses RLS. Server-side only; the
 * `server-only` import makes any client-bundle leak a build error.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!cached) {
    cached = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return cached;
}

export const STORAGE_BUCKET = "resources";
export const SIGNED_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour
