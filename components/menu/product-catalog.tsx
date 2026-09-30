import Image from "next/image";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
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

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ProductCatalog({
  combos,
  catalog,
  products,
  onChooseCombo,
  onChooseSize,
  apiStatus,
  catalogError,
}: ProductCatalogProps) {
  const [showFullCatalog, setShowFullCatalog] = useState(false);
  const apiStatusText = {
    checking: "Conectando à API",
    online: "Cardápio atualizado",
    offline: "API indisponível",
  }[apiStatus];
  const featuredSizes = catalog?.cupSizes.slice(0, 2) ?? [];
  const featuredCombos = combos.slice(0, 2);

  return (
    <section
      id="catalogo"
      className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20"
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
            Escolhas da casa
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-crimson sm:text-4xl">
            Itens em destaque
          </h2>
        </div>
        <div className="text-sm font-medium text-coral sm:text-base">
          <p>
            {(catalog?.flavors.length ?? 0) +
              (catalog?.cupSizes.length ?? 0) +
              (catalog?.toppings.length ?? 0) +
              (catalog?.sauces.length ?? 0) +
              (catalog?.fruits.length ?? 0) +
              (catalog?.extras.length ?? 0) +
              combos.length}{" "}
            opções no cardápio
          </p>
          <p
            role="status"
            className={`mt-1 text-xs ${apiStatus === "online" ? "text-green-800" : "text-crimson/75"}`}
          >
            {catalogError ? "Cardápio indisponível" : apiStatusText}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featuredSizes.map((size, index) => {
          const image = products[index % Math.max(products.length, 1)];
          return (
            <article
              key={`free-${size.id}`}
              className="group overflow-hidden rounded-md border border-blush/70 bg-white"
            >
              <div className="relative h-44 overflow-hidden bg-petal">
                {image && (
                  <Image
                    src={image.image}
                    alt={image.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-bold text-crimson">
                  Açaí livre
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-text">Açaí livre · {size.name}</h3>
                <p className="mt-2 min-h-10 text-sm text-crimson">
                  Monte com {catalog?.includedToppings ?? 0} acompanhamentos e {catalog?.includedFruits ?? 0} fruta(s) incluídos.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-petal pt-3">
                  <span className="text-base font-extrabold text-crimson">
                    {currency.format(size.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChooseSize(size.id)}
                    className="flex h-9 items-center gap-1.5 rounded-md bg-crimson px-3 text-xs font-bold text-white transition-colors hover:bg-dark"
                  >
                    Montar <ArrowRightIcon aria-hidden="true" size={15} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {featuredCombos.map((combo) => (
          <article
            key={combo.id}
            className="group overflow-hidden rounded-md border border-blush/70 bg-white"
          >
            <div className="relative h-44 overflow-hidden bg-petal">
              <Image
                src={combo.image}
                alt={combo.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-bold text-crimson">
                {combo.tag}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-text">{combo.name}</h3>
              <ul className="mt-2 min-h-10 space-y-1 text-sm text-crimson">
                <li className="flex items-start gap-2">
                  <CheckIcon aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-coral" />
                  {combo.includedToppings} acompanhamentos incluídos
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-coral" />
                  {combo.includedFruits} frutas · {combo.includedExtras} extras
                </li>
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-petal pt-3">
                <span className="text-base font-extrabold text-crimson">{combo.price}</span>
                <button
                  type="button"
                  onClick={() => onChooseCombo(combo)}
                  className="flex h-9 items-center gap-1.5 rounded-md bg-crimson px-3 text-xs font-bold text-white transition-colors hover:bg-dark"
                >
                  Personalizar <ArrowRightIcon aria-hidden="true" size={15} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-blush/70 pt-6">
        <p className="text-sm text-crimson sm:text-base">
          Veja tamanhos, sabores e todos os complementos disponíveis.
        </p>
        <button
          type="button"
          aria-expanded={showFullCatalog}
          aria-controls="catalogo-completo"
          onClick={() => setShowFullCatalog((visible) => !visible)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-crimson px-4 text-sm font-bold text-crimson transition-colors hover:bg-crimson hover:text-white"
        >
          {showFullCatalog ? "Fechar catálogo" : "Ver catálogo completo"}
          <ArrowRightIcon aria-hidden="true" size={17} />
        </button>
      </div>

      {showFullCatalog && catalog && (
        <div id="catalogo-completo" className="mt-6 space-y-8 border-t border-blush/70 pt-6">
          <section aria-labelledby="catalog-sizes-title">
            <h3 id="catalog-sizes-title" className="text-lg font-extrabold text-crimson">Açaí livre</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {catalog.cupSizes.map((size) => (
                <li key={size.id} className="flex items-center justify-between gap-3 border border-blush/70 bg-white px-4 py-3 text-sm">
                  <span className="font-semibold">{size.name}</span>
                  <span className="font-extrabold text-crimson">{currency.format(size.price)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="catalog-combos-title">
            <h3 id="catalog-combos-title" className="text-lg font-extrabold text-crimson">Combos</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {combos.map((combo) => (
                <li key={combo.id} className="flex items-center justify-between gap-3 border border-blush/70 bg-white px-4 py-3 text-sm">
                  <span className="font-semibold">{combo.name}</span>
                  <span className="font-extrabold text-crimson">{combo.price}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Sabores", catalog.flavors],
              ["Acompanhamentos", catalog.toppings],
              ["Caldas", catalog.sauces],
              ["Posições dos condimentos", catalog.condimentPositions],
              ["Frutas", catalog.fruits],
              ["Extras", catalog.extras],
            ].map(([title, choices]) => (
              <section key={title as string} aria-label={title as string}>
                <h3 className="text-sm font-extrabold text-crimson">{title as string}</h3>
                <ul className="mt-2 divide-y divide-blush/60 border-y border-blush/60 bg-white px-3">
                  {(choices as { id: string; name: string; price?: number }[]).map((choice) => (
                    <li key={choice.id} className="flex justify-between gap-3 py-2 text-xs">
                      <span className="font-medium text-text">{choice.name}</span>
                      {choice.price !== undefined && choice.price > 0 && (
                        <span className="shrink-0 font-bold text-crimson">{currency.format(choice.price)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
