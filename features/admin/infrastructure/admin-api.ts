export function requestAdminApi(path: string, init?: RequestInit) {
  return fetch(path.startsWith("/admin/api") ? path : `/admin/api${path}`, {
    cache: "no-store",
    ...init,
  });
}