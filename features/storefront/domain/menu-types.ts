export type Product = {
  name: string;
  description: string;
  size: string;
  price: string;
  tag: string;
  image: string;
  imageAlt: string;
};

export type MenuComboItem = {
  id: string;
  kind: string;
  name: string;
  quantity: number;
};

export type MenuCombo = {
  id: string;
  key?: string;
  sizeId?: string;
  category?: "combo" | "gourmet";
  name: string;
  size: string;
  price: string;
  priceCents: number;
  includedToppings: number;
  includedFruits: number;
  includedExtras: number;
  tag: string;
  image: string;
  imageAlt: string;
  items?: MenuComboItem[];
};
