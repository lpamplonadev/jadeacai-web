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
  description: string;
  imageUrl: string;
  imageAlt: string;
  priceCents: number;
  available: boolean;
  sortOrder: number;
  deletedAt: string | null;
};

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

export type CatalogGourmetSize = {
  sizeItemId: string;
  sizeName: string;
  priceCents: number;
  available: boolean;
};

export type CatalogGourmet = {
  id: string;
  gourmetKey: string;
  name: string;
  description: string;
  tag: string;
  imageUrl: string;
  imageAlt: string;
  available: boolean;
  sortOrder: number;
  deletedAt: string | null;
  items: CatalogComboItem[];
  sizes: CatalogGourmetSize[];
};

export type CatalogEntryEditor =
  | { type: "item"; item?: CatalogItem }
  | { type: "combo"; combo?: CatalogCombo };

export type CatalogEditor =
  | CatalogEntryEditor
  | { type: "gourmet"; gourmet?: CatalogGourmet };
