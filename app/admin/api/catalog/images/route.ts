import { uploadCatalogImage } from "@/features/admin/infrastructure/catalog-image-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return uploadCatalogImage(request);
}
