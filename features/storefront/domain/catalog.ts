import type { MenuCombo, MenuComboItem, MenuGourmet } from "./menu-types";

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

export type PublicCatalogGourmet = MenuGourmet;

export type PublicCatalog = {
  items: PublicCatalogItem[];
  combos: PublicCatalogCombo[];
  gourmets: PublicCatalogGourmet[];
  rules: Record<string, number>;
};
