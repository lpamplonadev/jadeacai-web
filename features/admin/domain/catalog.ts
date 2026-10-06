export type CatalogItemKind =
  | "flavor"
  | "size"
  | "topping"
  | "sauce"
  | "condiment_position"
  | "fruit"
  | "extra";

export type CatalogItem = {
  id: string;
  itemKey: string;
  kind: CatalogItemKind;
  name: string;
  priceCents: number;
  available: boolean;
  sortOrder: number;
  deletedAt: string | null;
};

export type CatalogComboCategory = "combo" | "gourmet";

export type CatalogComboItem = {
  itemId: string;
  itemKey: string;
  kind: CatalogItemKind;
  name: string;
  quantity: number;
  available: boolean;
};

export type CatalogCombo = {
  id: string;
  comboKey: string;
  category: CatalogComboCategory;
  name: string;
  sizeItemId: string;
  sizeName: string;
  priceCents: number;
  includedToppings: number;
  includedFruits: number;
  includedExtras: number;
  tag: string;
  imageUrl: string;
  imageAlt: string;
  available: boolean;
  sortOrder: number;
  deletedAt: string | null;
  items: CatalogComboItem[];
};

export type CatalogEditor =
  | { type: "item"; item?: CatalogItem }
  | {
      type: "combo";
      combo?: CatalogCombo;
      initialCategory?: CatalogComboCategory;
    };
