import Image from "next/image";
import { useState } from "react";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import type { BuilderCatalogData } from "@/components/menu/acai-builder-data";
import type { MenuCombo, Product } from "@/components/menu/menu-data";

type ProductCatalogProps = {
  combos: MenuCombo[];
  catalog: BuilderCatalogData | null;
  products: Product[];
  onChooseCombo: (combo: MenuCombo) => void;
  onChooseSize: (sizeId: string) => void;
  apiStatus: "checking" | "online" | "offline";
  catalogError: boolean;
};

type ProductCategory = "all" | "free" | "combo";
type SortOrder = "featured" | "price-asc" | "price-desc";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const filterInputClassName =
  "min-h-10 w-full rounded-md border border-blush bg-white px-3 text-sm text-text outline-none focus:border-crimson";

export function ProductCatalog({
  combos,
  catalog,
  products,
  onChooseCombo,
  onChooseSize,
  apiStatus,
  catalogError,
}: ProductCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [promotionsOnly, setPromotionsOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");

  const apiStatusText = {
    checking: "Conectando à API",
    online: "Cardápio atualizado",
    offline: "API indisponível",
  }[apiStatus];

  const productsToShow = catalog
    ? [
        ...catalog.cupSizes.map((size, index) => {
          const image = products[index % Math.max(products.length, 1)];
          return {
            id: `free-${size.id}`,
            type: "free" as const,
            name: `Açaí livre · ${size.name}`,
            description: `Monte com ${catalog.includedToppings} acompanhamentos e ${catalog.includedFruits} fruta(s) incluídos.`,
            price: size.price,
            tag: "Monte do seu jeito",
            image: image?.image ?? "",
            imageAlt: image?.imageAlt ?? size.name,
            rank: index,
            choose: () => onChooseSize(size.id),
          };
        }),
        ...combos.map((combo, index) => ({
          id: `combo-${combo.id}`,
          type: "combo" as const,
          name: combo.name,
          description: [
            (combo.items ?? [])
              .filter((item) => item.kind === "size")
              .map((item) => `${item.quantity} × ${item.name}`)
              .join(" + "),
            `${combo.includedToppings} acompanhamentos`,
            `${combo.includedFruits} frutas`,
            `${combo.includedExtras} extras incluídos`,
          ]
            .filter(Boolean)
            .join(" · "),
          price: combo.priceCents / 100,
          tag: combo.tag || "Combo",
          image: combo.image,
          imageAlt: combo.imageAlt,
          rank: index,
          choose: () => onChooseCombo(combo),
        })),
      ]
    : [];

  const query = search.trim().toLocaleLowerCase("pt-BR");
  const lowerPrice = minPrice === "" ? null : Number(minPrice);
  const upperPrice = maxPrice === "" ? null : Number(maxPrice);
  const filteredProducts = productsToShow.filter((product) => {
    if (category !== "all" && product.type !== category) return false;
    if (promotionsOnly && product.type !== "combo") return false;
    if (lowerPrice !== null && product.price < lowerPrice) return false;
    if (upperPrice !== null && product.price > upperPrice) return false;
    return (
      !query ||
      `${product.name} ${product.description} ${product.tag}`
        .toLocaleLowerCase("pt-BR")
        .includes(query)
    );
  });

  const sortedProducts = [...filteredProducts].sort((left, right) => {
    if (sortOrder === "price-asc") return left.price - right.price;
    if (sortOrder === "price-desc") return right.price - left.price;
    return left.rank - right.rank;
  });

  return (
    <section
      id="catalogo"
      className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-blush/80 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-crimson">
            Cardápio Jade
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-crimson sm:text-4xl">
            Escolha o seu açaí
          </h2>
        </div>
        <p
          role="status"
          className={`text-xs font-bold ${apiStatus === "online" ? "text-green-800" : "text-crimson/75"}`}
        >
          {catalogError ? "Cardápio indisponível" : apiStatusText}
        </p>
      </div>

      <div className="grid gap-8 pt-7 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside
          aria-label="Filtros do cardápio"
          className="space-y-7 lg:border-r lg:border-blush/80 lg:pr-7"
        >
          <fieldset>
            <legend className="mb-3 text-sm font-extrabold text-text">
              Categorias
            </legend>
            <div className="space-y-2">
              {(
                [
                  ["all", "Todos os produtos"],
                  ["free", "Açaí livre"],
                  ["combo", "Combos"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex min-h-9 cursor-pointer items-center gap-2 text-sm text-text"
                >
                  <input
                    type="radio"
                    name="catalog-category"
                    value={value}
                    checked={category === value}
                    onChange={() => setCategory(value)}
                    className="h-4 w-4 accent-crimson"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-extrabold text-text">
              Faixa de preço
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 text-xs font-semibold text-crimson">
                Mínimo
                <input
                  aria-label="Preço mínimo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="R$ 0"
                  className={filterInputClassName}
                />
              </label>
              <label className="space-y-1 text-xs font-semibold text-crimson">
                Máximo
                <input
                  aria-label="Preço máximo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Sem limite"
                  className={filterInputClassName}
                />
              </label>
            </div>
          </fieldset>

          <label className="flex min-h-10 cursor-pointer items-center gap-2 border-t border-blush/70 pt-4 text-sm font-semibold text-text">
            <input
              type="checkbox"
              checked={promotionsOnly}
              onChange={(event) => setPromotionsOnly(event.target.checked)}
              className="h-4 w-4 accent-crimson"
            />
            Combos em destaque
          </label>
        </aside>

        <div className="min-w-0">
          <label className="relative block">
            <span className="sr-only">Buscar no cardápio</span>
            <MagnifyingGlassIcon
              aria-hidden="true"
              size={19}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-crimson"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por tamanho ou combo"
              className="min-h-12 w-full rounded-md border border-blush bg-white pl-10 pr-4 text-sm text-text outline-none placeholder:text-muted-foreground focus:border-crimson"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 py-5">
            <p aria-live="polite" className="text-sm text-crimson">
              {sortedProducts.length}{" "}
              {sortedProducts.length === 1 ? "produto" : "produtos"}
            </p>
            <label className="flex items-center gap-2 text-xs font-semibold text-crimson">
              Ordenar por
              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as SortOrder)
                }
                className="min-h-10 rounded-md border border-blush bg-white px-3 text-sm text-text outline-none focus:border-crimson"
              >
                <option value="featured">Relevância</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
            </label>
          </div>

          {sortedProducts.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sortedProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-md border border-blush/70 bg-white"
                >
                  <div className="relative h-48 overflow-hidden bg-petal">
                    {product.image && (
                      <>
                        <Image
                          src={product.image}
                          alt=""
                          aria-hidden="true"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="scale-110 object-cover opacity-60 blur-xl"
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-cream/25"
                        />
                      </>
                    )}
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.imageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="z-10 object-contain"
                      />
                    )}
                    <span className="absolute left-3 top-3 z-20 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-bold text-crimson">
                      {product.tag}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-extrabold uppercase text-crimson">
                      {product.type === "free" ? "Açaí livre" : "Combo"}
                    </p>
                    <h3 className="mt-1 min-h-12 font-bold text-text">
                      {product.name}
                    </h3>
                    <p className="min-h-10 text-sm leading-5 text-crimson/75">
                      {product.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-petal pt-3">
                      <span className="text-lg font-extrabold text-crimson">
                        {currency.format(product.price)}
                      </span>
                      <button
                        type="button"
                        onClick={product.choose}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-crimson px-3 text-xs font-bold text-white transition-colors hover:bg-dark"
                      >
                        {product.type === "free" ? "Montar" : "Personalizar"}
                        <ArrowRightIcon aria-hidden="true" size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="border-y border-blush/70 py-16 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado com esses filtros.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
