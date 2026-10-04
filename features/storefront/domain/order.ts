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
  customer: { name: string; phone: string };
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