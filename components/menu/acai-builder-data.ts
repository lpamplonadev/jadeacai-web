import type { MenuCombo } from "@/components/menu/menu-data";

export type BuilderChoice = {
  id: string;
  name: string;
};

export type BuilderExtra = BuilderChoice & {
  price: number;
};

export type SelectionGroup = "toppings" | "fruits" | "extras";
export type PendingSelection = { group: SelectionGroup; id: string };

export const flavors: BuilderChoice[] = [
  { id: "banana", name: "Açaí de banana" },
  { id: "morango", name: "Açaí de morango" },
];

export const cupSizes = [
  { id: "300", name: "300 ml", price: 11.9 },
  { id: "500", name: "500 ml", price: 15.9 },
  { id: "770", name: "770 ml", price: 17.9 },
  { id: "1000", name: "Marmita", price: 25.9 },
];

export const toppings: BuilderChoice[] = [
  { id: "canudinho", name: "Biscoito canudinho" },
  { id: "pacoca", name: "Paçoca" },
  { id: "granulado", name: "Granulado" },
  { id: "leite-em-po", name: "Leite em pó" },
  { id: "disquete", name: "Disquete (M&M)" },
  { id: "chocoball", name: "Chocoball" },
  { id: "jujubas", name: "Jujubas" },
  { id: "amendoim", name: "Amendoim" },
  { id: "granola", name: "Granola" },
  { id: "marshmallow", name: "Marshmallow" },
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

export type CondimentPosition = (typeof condimentPositions)[number];

export const fruits: BuilderChoice[] = [
  { id: "morango", name: "Morango" },
  { id: "banana", name: "Banana" },
  { id: "uva", name: "Uva" },
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
export const deliveryFee = 3;
export const whatsappNumber = "5521990174473";

export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function getCupSizeForCombo(combo: MenuCombo) {
  return (
    cupSizes.find(
      (size) =>
        size.name === combo.size ||
        `${size.id} ml` === combo.size ||
        (size.id === "1000" && combo.size === "1 litro"),
    ) ?? cupSizes[1]
  );
}
