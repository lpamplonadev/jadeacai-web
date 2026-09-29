import type { MenuCombo } from "@/components/menu/menu-data";

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

export type CreateOrderRequest = {
  customer: {
    name: string;
    phone: string;
  };
  acai: {
    flavorId: string;
    sizeId: string;
    comboId: string;
    toppingIds: string[];
    sauceId: string;
    condimentPositionId: string;
    fruitIds: string[];
    extraIds: string[];
  };
  delivery: {
    postalCode: string;
    street: string;
    number: string;
    neighborhood: string;
    complement: string;
    reference: string;
  };
  payment: {
    method: "pix" | "cash" | "card";
    needsChange: boolean;
    changeForCents: number;
  };
  notes: string;
  estimatedTotalCents: number;
};

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

export async function createOrder(order: CreateOrderRequest) {
  return requestJson<{ status: string; persisted: boolean }>("/api/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
}
