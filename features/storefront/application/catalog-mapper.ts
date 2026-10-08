import type {
  PublicCatalog,
  PublicCatalogItem,
} from "@/features/storefront/domain/catalog";
import type {
  BuilderCatalogData,
  BuilderChoice,
  BuilderPriceChoice,
} from "@/features/storefront/domain/acai-builder-data";

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
  const rule = (key: string, fallback: number) =>
    catalog.rules[key] ?? fallback;
  return {
    flavors: asChoices(itemsOfKind(catalog, "flavor")),
    cupSizes: itemsOfKind(catalog, "size").map(
      ({ id, name, priceCents, description, image, imageAlt }) => ({
        id,
        name,
        price: priceCents / 100,
        description,
        image,
        imageAlt,
      }),
    ),
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
