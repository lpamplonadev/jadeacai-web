import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { BuilderCatalogData } from "@/features/storefront/domain/acai-builder-data";
import type {
  MenuCombo,
  Product,
} from "@/features/storefront/domain/menu-types";

type ProductCatalogProps = {
  combos: MenuCombo[];
  catalog: BuilderCatalogData | null;
  products: Product[];
  storeIsOpen: boolean;
  onChooseCombo: (combo: MenuCombo) => void;
  onChooseSize: (sizeId: string) => void;
  apiStatus: "checking" | "online" | "offline";
  catalogError: boolean;
};

type ProductCategory = "all" | "free" | "combo" | "gourmet";
type SortOrder = "featured" | "price-asc" | "price-desc";

type CatalogProduct = {
  id: string;
  type: "free" | "combo" | "gourmet";
  name: string;
  description: string;
  details: string;
  highlights: string[];
  price: number;
  tag: string;
  image: string;
  imageAlt: string;
  rank: number;
  choose: () => void;
};

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
  storeIsOpen,
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
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(
    null,
  );
  const detailsDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = detailsDialogRef.current;
    if (!dialog) return;
    if (selectedProduct && !dialog.open) dialog.showModal();
    if (!selectedProduct && dialog.open) dialog.close();
  }, [selectedProduct]);

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
            description: `Monte com ${catalog.includedToppings} acompanhamentos e ${catalog.includedFruits} ${catalog.includedFruits === 1 ? "fruta incluída" : "frutas incluídas"}.`,
            details: `Um açaí do seu jeito, do primeiro ao último detalhe. Escolha o sabor, combine seus acompanhamentos favoritos e finalize com frutas. Este tamanho inclui ${catalog.includedToppings} acompanhamentos e ${catalog.includedFruits} ${catalog.includedFruits === 1 ? "fruta" : "frutas"}; adicionais e valores aparecem no configurador.`,
            highlights: [
              `Tamanho ${size.name}`,
              `${catalog.includedToppings} ${catalog.includedToppings === 1 ? "acompanhamento incluído" : "acompanhamentos incluídos"}`,
              `${catalog.includedFruits} ${catalog.includedFruits === 1 ? "fruta incluída" : "frutas incluídas"}`,
              "Sabor e complementos escolhidos por você",
            ],
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
          type: combo.category === "gourmet" ? ("gourmet" as const) : ("combo" as const),
          name: combo.name,
          description:
            combo.category === "gourmet"
              ? combo.description || "Uma receita exclusiva, pronta para saborear."
              : [
                  (combo.items ?? [])
                    .filter((item) => item.kind === "size")
                    .map((item) => `${item.quantity} × ${item.name}`)
                    .join(" + "),
                  `${combo.includedToppings} ${combo.includedToppings === 1 ? "acompanhamento" : "acompanhamentos"}`,
                  ...(combo.includedFruits > 0
                    ? [
                        `${combo.includedFruits} ${combo.includedFruits === 1 ? "fruta" : "frutas"}`,
                      ]
                    : []),
                  ...(combo.includedExtras > 0
                    ? [
                        `${combo.includedExtras} ${combo.includedExtras === 1 ? "extra incluído" : "extras incluídos"}`,
                      ]
                    : []),
                ]
                  .filter(Boolean)
                  .join(" · "),
          details:
            combo.category === "gourmet"
              ? combo.description || "Uma receita exclusiva, preparada pela casa."
              : `${combo.name} reúne uma combinação caprichada de tamanhos e complementos para aproveitar seu açaí com praticidade. Personalize o sabor de cada porção no configurador; as inclusões do combo já aparecem por lá.`,
          highlights:
            combo.category === "gourmet"
              ? (combo.items ?? [])
                  .filter((item) => item.kind !== "size")
                  .map((item) => `${item.quantity} × ${item.name}`)
              : [
                  ...(combo.items ?? []).map(
                    (item) => `${item.quantity} × ${item.name}`,
                  ),
                  `${combo.includedToppings} ${combo.includedToppings === 1 ? "acompanhamento incluído" : "acompanhamentos incluídos"}`,
                  combo.includedFruits > 0
                    ? `${combo.includedFruits} ${combo.includedFruits === 1 ? "fruta incluída" : "frutas incluídas"}`
                    : "Frutas disponíveis para personalizar",
                  combo.includedExtras > 0
                    ? `${combo.includedExtras} ${combo.includedExtras === 1 ? "extra incluído" : "extras incluídos"}`
                    : "Extras disponíveis para personalizar",
                ],
          price: combo.priceCents / 100,
          tag:
            combo.tag ||
            (combo.category === "gourmet" ? "Receita da casa" : "Combo"),
          image: combo.image,
          imageAlt: combo.imageAlt,
          rank: index,
          choose: () => onChooseCombo(combo),
        })),
      ]
    : [];

  function customizeSelectedProduct() {
    if (!selectedProduct) return;
    const choose = selectedProduct.choose;
    setSelectedProduct(null);
    choose();
  }

  const query = search.trim().toLocaleLowerCase("pt-BR");
  const lowerPrice = minPrice === "" ? null : Number(minPrice);
  const upperPrice = maxPrice === "" ? null : Number(maxPrice);
  const filteredProducts = productsToShow.filter((product) => {
    if (category !== "all" && product.type !== category) return false;
    if (promotionsOnly && product.type === "free") return false;
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
                  ["gourmet", "Gourmet"],
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
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    aria-label={`Ver detalhes de ${product.name}`}
                    className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-crimson"
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
                          <Image
                            src={product.image}
                            alt={product.imageAlt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="z-10 object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                          />
                        </>
                      )}
                      <span className="absolute left-3 top-3 z-20 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-bold text-crimson">
                        {product.tag}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-extrabold uppercase text-crimson">
                        {product.type === "free"
                          ? "Açaí livre"
                          : product.type === "gourmet"
                            ? "Gourmet"
                            : "Combo"}
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
                        <span className="inline-flex min-h-10 items-center gap-1.5 rounded-md bg-crimson px-3 text-xs font-bold text-white transition-colors group-hover:bg-dark">
                          Ver detalhes
                          <ArrowRightIcon aria-hidden="true" size={15} />
                        </span>
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="border-y border-blush/70 py-16 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado com esses filtros.
            </p>
          )}

          <dialog
            ref={detailsDialogRef}
            aria-labelledby="catalog-product-title"
            onCancel={(event) => {
              event.preventDefault();
              setSelectedProduct(null);
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedProduct(null);
              }
            }}
            className="m-auto max-h-[90dvh] w-[calc(100vw-2rem)] max-w-4xl overflow-y-auto rounded-md border border-blush bg-cream p-0 text-text shadow-2xl backdrop:bg-text/60"
          >
            {selectedProduct && (
              <div className="grid md:grid-cols-2">
                <div className="relative min-h-64 bg-petal md:min-h-[30rem]">
                  {selectedProduct.image && (
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-contain p-5"
                    />
                  )}
                </div>
                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-extrabold uppercase text-crimson">
                      {selectedProduct.type === "free"
                        ? "Açaí livre"
                        : selectedProduct.type === "gourmet"
                          ? "Gourmet"
                          : selectedProduct.tag || "Combo"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      aria-label="Fechar detalhes do produto"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-blush text-crimson transition-colors hover:bg-petal"
                    >
                      <XIcon aria-hidden="true" size={19} />
                    </button>
                  </div>
                  <h2
                    id="catalog-product-title"
                    className="mt-3 text-2xl font-black text-crimson sm:text-3xl"
                  >
                    {selectedProduct.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-text/80">
                    {selectedProduct.details}
                  </p>
                  <ul className="mt-5 space-y-2 border-y border-blush/80 py-4 text-sm text-crimson">
                    {selectedProduct.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="font-black text-coral"
                        >
                          •
                        </span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-crimson/75">
                        Valor
                      </p>
                      <p className="text-2xl font-black text-crimson">
                        {currency.format(selectedProduct.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={customizeSelectedProduct}
                      disabled={!storeIsOpen}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-crimson px-4 text-sm font-extrabold text-white transition-colors hover:bg-dark"
                    >
                      {storeIsOpen ? (
                        <>
                          {selectedProduct.type === "free"
                            ? "Montar meu açaí"
                            : selectedProduct.type === "gourmet"
                              ? "Ver receita Gourmet"
                              : "Personalizar combo"}
                          <ArrowRightIcon aria-hidden="true" size={17} />
                        </>
                      ) : (
                        "Loja fechada"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </dialog>
        </div>
      </div>
    </section>
  );
}
