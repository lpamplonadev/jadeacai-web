import type { PublicCatalog } from "@/features/storefront/domain/catalog";
import type { MenuCombo } from "@/features/storefront/domain/menu-types";
import type { CreateOrderRequest } from "@/features/storefront/domain/order";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

type ApiMenuCombo = Pick<
  MenuCombo,
  | "id"
  | "name"
  | "size"
  | "priceCents"
  | "includedToppings"
  | "includedFruits"
  | "includedExtras"
  | "tag"
>;

function getEndpoint(path: string) {
  if (!apiBaseUrl) {
    throw new Error("Configure NEXT_PUBLIC_API_URL para conectar à API.");
  }
  return `${apiBaseUrl}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getEndpoint(path), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`A API respondeu com erro (${response.status}).`);
  }

  return (await response.json()) as T;
}

export async function getApiHealth() {
  return requestJson<{ status: string }>("/health");
}

export async function getMenuCombos() {
  const response = await requestJson<{ combos: ApiMenuCombo[] }>(
    "/api/v1/menu/combos",
  );
  return response.combos;
}

export async function getPublicCatalog() {
  return requestJson<PublicCatalog>("/api/v1/menu/catalog");
}

export async function createOrder(order: CreateOrderRequest) {
  return requestJson<{ status: string; persisted: boolean }>("/api/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
}
