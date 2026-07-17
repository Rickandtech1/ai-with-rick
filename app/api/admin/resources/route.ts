import { randomUUID, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { siteUrl } from "@/lib/site-config";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase/admin";
import { RESOURCE_FORMATS } from "@/lib/types";

/**
 * Programmatic publishing — push a resource without opening the admin UI.
 *
 * POST /api/admin/resources
 * Authorization: Bearer $ADMIN_API_SECRET
 *
 * Either application/json:
 *   { title, description, format, published_date?, body_content?,
 *     external_url?, file_path?, visible?, featured? }
 * or multipart/form-data with the same fields plus a `file` part
 * (and optionally a markdown twin as `md_file`), uploaded to the
 * private bucket in the same call.
 */

function authorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

interface ResourceInput {
  title: string;
  description: string;
  format: string;
  published_date: string;
  body_content: string;
  external_url: string | null;
  file_path: string | null;
  visible: boolean;
  featured: boolean;
  require_lead: boolean;
}

function parseBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "1", "on", "yes"].includes(value.toLowerCase());
  return fallback;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  let input: ResourceInput;
  let file: File | null = null;
  let mdFile: File | null = null;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const maybeFile = form.get("file");
      if (maybeFile instanceof File && maybeFile.size > 0) file = maybeFile;
      const maybeMd = form.get("md_file");
      if (maybeMd instanceof File && maybeMd.size > 0) mdFile = maybeMd;
      input = {
        title: String(form.get("title") ?? "").trim(),
        description: String(form.get("description") ?? "").trim(),
        format: String(form.get("format") ?? ""),
        published_date: String(form.get("published_date") ?? "").trim() || new Date().toISOString().slice(0, 10),
        body_content: String(form.get("body_content") ?? ""),
        external_url: String(form.get("external_url") ?? "").trim() || null,
        file_path: String(form.get("file_path") ?? "").trim() || null,
        visible: parseBool(form.get("visible"), true),
        featured: parseBool(form.get("featured"), false),
        require_lead: parseBool(form.get("require_lead"), true),
      };
    } else {
      const body = await request.json();
      input = {
        title: String(body.title ?? "").trim(),
        description: String(body.description ?? "").trim(),
        format: String(body.format ?? ""),
        published_date: String(body.published_date ?? "").trim() || new Date().toISOString().slice(0, 10),
        body_content: String(body.body_content ?? ""),
        external_url: body.external_url ? String(body.external_url) : null,
        file_path: body.file_path ? String(body.file_path) : null,
        visible: parseBool(body.visible, true),
        featured: parseBool(body.featured, false),
        require_lead: parseBool(body.require_lead, true),
      };
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!input.title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!(RESOURCE_FORMATS as readonly string[]).includes(input.format)) {
    return NextResponse.json(
      { error: `format must be one of: ${RESOURCE_FORMATS.join(", ")}` },
      { status: 400 }
    );
  }

  if (file) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || "file";
    const path = `${randomUUID()}-${safeName}`;
    const { error } = await db.storage
      .from(STORAGE_BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type || "application/octet-stream",
      });
    if (error) {
      return NextResponse.json({ error: `File upload failed: ${error.message}` }, { status: 500 });
    }
    input.file_path = path;
  }

  let mdPath: string | null = null;
  if (mdFile) {
    const safeName = mdFile.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || "file.md";
    const path = `${randomUUID()}-${safeName}`;
    const { error } = await db.storage
      .from(STORAGE_BUCKET)
      .upload(path, Buffer.from(await mdFile.arrayBuffer()), { contentType: "text/markdown" });
    if (error) {
      return NextResponse.json({ error: `Markdown upload failed: ${error.message}` }, { status: 500 });
    }
    mdPath = path;
  }

  if (input.featured) {
    await db.from("resources").update({ featured: false }).eq("featured", true);
  }

  const { data, error } = await db
    .from("resources")
    .insert({
      title: input.title,
      description: input.description,
      format: input.format,
      published_date: input.published_date,
      body_content: input.body_content,
      external_url: input.external_url,
      file_path: input.file_path,
      visible: input.visible,
      featured: input.featured,
      require_lead: input.require_lead,
      ...(mdPath ? { md_path: mdPath } : {}),
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/");
  return NextResponse.json(
    { resource: data, public_url: siteUrl(`/r/${data.id}`) },
    { status: 201 }
  );
}
