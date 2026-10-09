import type { MenuCombo } from "@/features/storefront/domain/menu-types";

export type BuilderChoice = {
  id: string;
  name: string;
};

export type BuilderExtra = BuilderChoice & {
  price: number;
};

export type BuilderPriceChoice = BuilderChoice & {
  price: number;
  description?: string;
  image?: string;
  imageAlt?: string;
};

export type BuilderCatalogData = {
  flavors: BuilderChoice[];
  cupSizes: BuilderPriceChoice[];
  toppings: BuilderPriceChoice[];
  sauces: BuilderChoice[];
  condimentPositions: (BuilderChoice & { price: number })[];
  fruits: BuilderPriceChoice[];
  extras: BuilderExtra[];
  includedToppings: number;
  includedFruits: number;
  additionalToppingPrice: number;
  additionalFruitPrice: number;
};

export type SelectionGroup = "toppings" | "fruits" | "extras";
export type PendingSelection = { group: SelectionGroup; id: string };

export const flavors: BuilderChoice[] = [
  { id: "banana", name: "Açaí de banana" },
  { id: "morango", name: "Açaí de morango" },
];

export const cupSizes: BuilderPriceChoice[] = [
  { id: "300", name: "300 ml", price: 11.9 },
  { id: "500", name: "500 ml", price: 15.9 },
  { id: "770", name: "770 ml", price: 17.9 },
  { id: "1000", name: "Marmita", price: 25.9 },
];

export const toppings: BuilderPriceChoice[] = [
  { id: "canudinho", name: "Biscoito canudinho", price: 1 },
  { id: "pacoca", name: "Paçoca", price: 1 },
  { id: "granulado", name: "Granulado", price: 1 },
  { id: "leite-em-po", name: "Leite em pó", price: 1 },
  { id: "disquete", name: "Disquete (M&M)", price: 1 },
  { id: "chocoball", name: "Chocoball", price: 1 },
  { id: "jujubas", name: "Jujubas", price: 1 },
  { id: "amendoim", name: "Amendoim", price: 1 },
  { id: "granola", name: "Granola", price: 1 },
  { id: "marshmallow", name: "Marshmallow", price: 1 },
];

export const sauces: BuilderChoice[] = [
  { id: "chocolate", name: "Chocolate" },
  { id: "morango", name: "Morango" },
  { id: "menta", name: "Menta" },
  { id: "uva", name: "Uva" },
];

export const condimentPositions = [
  { id: "bottom", name: "Embaixo somente", price: 0 },
  { id: "middle", name: "No meio somente", price: 0 },
  { id: "top", name: "No topo somente", price: 0 },
  { id: "bottom-middle", name: "Embaixo e no meio", price: 0 },
  { id: "middle-top", name: "No meio e no topo", price: 0 },
  { id: "bottom-top", name: "Embaixo e no topo", price: 0 },
  {
    id: "all-layers",
    name: "Embaixo, no meio e no topo",
    price: 3,
  },
];

export type CondimentPosition = BuilderChoice & { price: number };

export const fruits: BuilderPriceChoice[] = [
  { id: "morango", name: "Morango", price: 2 },
  { id: "banana", name: "Banana", price: 2 },
  { id: "uva", name: "Uva", price: 2 },
];

export const extras: BuilderExtra[] = [
  { id: "leite-condensado", name: "Leite condensado", price: 3 },
  { id: "chantilly", name: "Chantily", price: 3 },
  { id: "nutella", name: "Nutella", price: 3 },
  { id: "ovomaltine", name: "Ovomaltine", price: 3 },
];

export const includedToppings = 6;
export const additionalToppingPrice = 1;
export const includedFruits = 1;
export const additionalFruitPrice = 2;

export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function getCupSizeForCombo(
  combo: MenuCombo,
  availableCupSizes: BuilderPriceChoice[] = cupSizes,
) {
  return (
    availableCupSizes.find(
      (size) =>
        size.id === combo.sizeId ||
        size.name === combo.size ||
        `${size.id} ml` === combo.size ||
        (size.id === "1000" && combo.size === "1 litro"),
    ) ?? availableCupSizes[0] ?? cupSizes[1]
  );
}
