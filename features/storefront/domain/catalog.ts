import type { MenuCombo, MenuComboItem } from "./menu-types";

export type PublicCatalogItem = {
  id: string;
  key: string;
  kind: string;
  name: string;
  priceCents: number;
  sortOrder: number;
};

export type PublicCatalogCombo = Pick<
  MenuCombo,
  | "id"
  | "name"
  | "size"
  | "priceCents"
  | "includedToppings"
  | "includedFruits"
  | "includedExtras"
  | "tag"
> & {
  key: string;
  sizeId: string;
  image: string;
  imageAlt: string;
  items: MenuComboItem[];
};

export type PublicCatalog = {
  items: PublicCatalogItem[];
  combos: PublicCatalogCombo[];
  rules: Record<string, number>;
};
