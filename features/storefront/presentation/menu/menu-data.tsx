import {
  GearIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@phosphor-icons/react";
import type { MenuCombo, Product } from "@/features/storefront/domain/menu-types";

export type { MenuCombo, MenuComboItem, Product } from "@/features/storefront/domain/menu-types";

export const products: Product[] = [
  {
    name: "Açaí Tradicional",
    description: "Açaí cremoso, banana, granola e mel.",
    size: "300 ml",
    price: "R$ 18,90",
    tag: "O queridinho",
    image:
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Tigela de açaí com frutas frescas e granola",
  },
  {
    name: "Açaí com Morango",
    description: "Morangos frescos, leite em pó e muita cremosidade.",
    size: "500 ml",
    price: "R$ 26,90",
    tag: "Feito com fruta",
    image:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Frutas vermelhas frescas servidas em uma tigela",
  },
  {
    name: "Açaí Power",
    description: "Banana, paçoca e leite em pó para recarregar.",
    size: "500 ml",
    price: "R$ 29,90",
    tag: "Energia boa",
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Bowl colorido com frutas frescas e acompanhamentos",
  },
  {
    name: "Barca Jade",
    description: "Açaí, frutas e acompanhamentos para compartilhar.",
    size: "1 litro",
    price: "R$ 49,90",
    tag: "Pra dividir",
    image:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Bowl de frutas frescas e açaí para compartilhar",
  },
];

export const combos: MenuCombo[] = [
  {
    id: "combo-300",
    name: "Combo 300 ml",
    size: "300 ml",
    price: "R$ 12,90",
    priceCents: 1290,
    includedToppings: 3,
    includedFruits: 0,
    includedExtras: 1,
    tag: "Seu primeiro Jade",
    image:
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Açaí servido com acompanhamentos",
  },
  {
    id: "combo-500",
    name: "Combo 500 ml",
    size: "500 ml",
    price: "R$ 16,90",
    priceCents: 1690,
    includedToppings: 3,
    includedFruits: 1,
    includedExtras: 1,
    tag: "Mais pedido",
    image:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Frutas frescas para acompanhar açaí",
  },
  {
    id: "combo-770",
    name: "Combo 770 ml",
    size: "770 ml",
    price: "R$ 19,90",
    priceCents: 1990,
    includedToppings: 5,
    includedFruits: 1,
    includedExtras: 1,
    tag: "Pra matar a vontade",
    image:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Bowl generoso de açaí com frutas e acompanhamentos",
  },
  {
    id: "combo-marmita",
    name: "Combo Marmita",
    size: "1 litro",
    price: "R$ 28,90",
    priceCents: 2890,
    includedToppings: 6,
    includedFruits: 2,
    includedExtras: 1,
    tag: "Pra compartilhar",
    image:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Açaí grande com frutas para compartilhar",
  },
];

export const navigation = [
  { label: "Início", icon: <HouseIcon />, href: "#inicio" },
  { label: "Buscar", icon: <MagnifyingGlassIcon />, href: "#catalogo" },
  {
    label: "Sacola",
    icon: <ShoppingCartIcon />,
    href: "#catalogo",
    featured: true,
  },
  { label: "Perfil", icon: <UserIcon />, href: "#sobre" },
  { label: "Mais", icon: <GearIcon />, href: "#sobre" },
];
