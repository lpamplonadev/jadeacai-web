import type { MenuCombo } from "@/components/menu/menu-data";
import type {
  BuilderCatalogData,
  BuilderChoice,
  BuilderPriceChoice,
} from "@/components/menu/acai-builder-data";

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

export type PublicCatalogItem = {
  id: string;
  key: string;
  kind: string;
  name: string;
  priceCents: number;
  sortOrder: number;
};

export type PublicCatalogCombo = ApiMenuCombo & {
  key: string;
  sizeId: string;
  image: string;
  imageAlt: string;
  items: NonNullable<MenuCombo["items"]>;
};

export type PublicCatalog = {
  items: PublicCatalogItem[];
  combos: PublicCatalogCombo[];
  rules: Record<string, number>;
};

export type OrderAcaiConfiguration = {
  flavorId: string;
  sizeId: string;
  comboId: string;
  toppingIds: string[];
  sauceId: string;
  condimentPositionId: string;
  fruitIds: string[];
  extraIds: string[];
};

export type CreateOrderLine = {
  id: string;
  name: string;
  description: string;
  acai: OrderAcaiConfiguration;
  estimatedSubtotalCents: number;
};

export type CreateOrderRequest = {
  customer: {
    name: string;
    phone: string;
  };
  acai: OrderAcaiConfiguration;
  items: CreateOrderLine[];
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

export async function getPublicCatalog() {
  return requestJson<PublicCatalog>("/api/v1/menu/catalog");
}

function itemsOfKind(catalog: PublicCatalog, kind: string) {
  return catalog.items
    .filter((item) => item.kind === kind)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function asChoices(items: PublicCatalogItem[]): BuilderChoice[] {
  return items.map(({ id, name }) => ({ id, name }));
}

function asPricedChoices(items: PublicCatalogItem[]): BuilderPriceChoice[] {
  return items.map(({ id, name, priceCents }) => ({
    id,
    name,
    price: priceCents / 100,
  }));
}

export function toBuilderCatalog(catalog: PublicCatalog): BuilderCatalogData {
  const rule = (key: string, fallback: number) => catalog.rules[key] ?? fallback;
  return {
    flavors: asChoices(itemsOfKind(catalog, "flavor")),
    cupSizes: asPricedChoices(itemsOfKind(catalog, "size")),
    toppings: asPricedChoices(itemsOfKind(catalog, "topping")),
    sauces: asChoices(itemsOfKind(catalog, "sauce")),
    condimentPositions: asPricedChoices(
      itemsOfKind(catalog, "condiment_position"),
    ),
    fruits: asPricedChoices(itemsOfKind(catalog, "fruit")),
    extras: asPricedChoices(itemsOfKind(catalog, "extra")),
    includedToppings: rule("included_toppings", 6),
    includedFruits: rule("included_fruits", 1),
    additionalToppingPrice: rule("additional_topping_price_cents", 100) / 100,
    additionalFruitPrice: rule("additional_fruit_price_cents", 200) / 100,
    deliveryFee: rule("delivery_fee_cents", 300) / 100,
  };
}

export async function createOrder(order: CreateOrderRequest) {
  return requestJson<{ status: string; persisted: boolean }>("/api/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
}
