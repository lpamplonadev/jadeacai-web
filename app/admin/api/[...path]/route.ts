import {
  handleAdminProxy,
  type AdminProxyContext,
} from "@/features/admin/infrastructure/admin-api-proxy";

export const runtime = "nodejs";

export async function GET(request: Request, context: AdminProxyContext) {
  return handleAdminProxy(request, context);
}

export async function POST(request: Request, context: AdminProxyContext) {
  return handleAdminProxy(request, context);
}

export async function PATCH(request: Request, context: AdminProxyContext) {
  return handleAdminProxy(request, context);
}

export async function DELETE(request: Request, context: AdminProxyContext) {
  return handleAdminProxy(request, context);
}
