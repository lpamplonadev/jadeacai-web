import { randomUUID } from "node:crypto";
import { hasValidAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const bucketName = "catalog-images";
const maxImageSizeBytes = 5 * 1024 * 1024;
const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function jsonError(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function hasValidImageSignature(file: File, mimeType: string) {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (mimeType === "image/jpeg") {
    return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (byte, index) => header[index] === byte,
    );
  }
  if (mimeType === "image/webp") {
    return (
      String.fromCharCode(...header.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...header.slice(8, 12)) === "WEBP"
    );
  }
  return false;
}

export async function POST(request: Request) {
  if (!(await hasValidAdminSession())) {
    return jsonError("admin session required", 401);
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonError("catalog image storage is not configured", 503);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxImageSizeBytes + 64 * 1024) {
    return jsonError("image exceeds the 5 MB limit", 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("invalid image upload", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("select an image to upload", 400);
  }

  const extension = imageExtensions[file.type];
  if (!extension) {
    return jsonError("use a JPEG, PNG, or WebP image", 415);
  }
  if (file.size > maxImageSizeBytes) {
    return jsonError("image exceeds the 5 MB limit", 413);
  }
  if (!(await hasValidImageSignature(file, file.type))) {
    return jsonError("file content does not match a supported image", 415);
  }

  const objectName = `${randomUUID()}.${extension}`;
  const uploadUrl = new URL(
    `/storage/v1/object/${bucketName}/${objectName}`,
    supabaseUrl,
  );

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": file.type,
        "Cache-Control": "max-age=3600",
        "x-upsert": "false",
      },
      body: await file.arrayBuffer(),
      cache: "no-store",
    });

    if (!response.ok) {
      return jsonError("could not upload image to Supabase Storage", 502);
    }
  } catch {
    return jsonError("Supabase Storage is unavailable", 502);
  }

  const imageUrl = new URL(
    `/storage/v1/object/public/${bucketName}/${objectName}`,
    supabaseUrl,
  ).toString();

  return Response.json(
    { imageUrl },
    { headers: { "Cache-Control": "no-store" } },
  );
}