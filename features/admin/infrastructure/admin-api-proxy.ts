import { hasValidAdminSession } from "@/features/admin/infrastructure/admin-auth";

export type AdminProxyContext = {
  params: Promise<{ path: string[] }>;
};

function jsonError(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function handleAdminProxy(
  request: Request,
  context: AdminProxyContext,
) {
  if (!(await hasValidAdminSession())) {
    return jsonError("admin session required", 401);
  }

  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
    /\/+$/,
    "",
  );
  const apiKey = process.env.ADMIN_API_KEY;
  if (!apiBaseUrl || !apiKey) {
    return jsonError("admin API proxy is not configured", 503);
  }

  const { path } = await context.params;
  if (
    !path.length ||
    path.some((segment) => !/^[a-zA-Z0-9_-]+$/.test(segment))
  ) {
    return jsonError("invalid admin API path", 400);
  }

  try {
    const targetUrl = new URL(
      `/api/v1/admin/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`,
      apiBaseUrl,
    );
    const headers = new Headers({
      Accept: request.headers.get("accept") ?? "application/json",
      Authorization: `Bearer ${apiKey}`,
    });
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    const upstreamResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    const upstreamContentType = upstreamResponse.headers.get("content-type");
    if (upstreamContentType) {
      responseHeaders.set("Content-Type", upstreamContentType);
    }
    const body =
      upstreamResponse.status === 204 ||
      upstreamResponse.status === 205 ||
      upstreamResponse.status === 304
        ? null
        : await upstreamResponse.arrayBuffer();

    return new Response(body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return jsonError("admin API is unavailable", 502);
  }
}
