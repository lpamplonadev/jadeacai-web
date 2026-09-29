import Image from "next/image";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import type { MenuCombo } from "@/components/menu/menu-data";

type ProductCatalogProps = {
  combos: MenuCombo[];
  onChooseCombo: (combo: MenuCombo) => void;
  apiStatus: "checking" | "online" | "offline";
  catalogError: boolean;
};

export function ProductCatalog({
  combos,
  onChooseCombo,
  apiStatus,
  catalogError,
}: ProductCatalogProps) {
  const apiStatusText = {
    checking: "Conectando à API",
    online: "API conectada",
    offline: "API indisponível",
  }[apiStatus];

  return (
    <section
      id="catalogo"
      className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20"
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
            Escolha seu tamanho favorito
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-crimson sm:text-4xl">
            Combos Jade
          </h2>
        </div>
        <div className="text-sm font-medium text-coral sm:text-base">
          <p>{combos.length} tamanhos para escolher</p>
          <p
            role="status"
            className={`mt-1 text-xs ${apiStatus === "online" ? "text-green-800" : "text-crimson/75"}`}
          >
            {catalogError
              ? "Exibindo cardápio salvo neste site"
              : apiStatusText}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {combos.map((combo) => {
          return (
            <article
              key={combo.id}
              className="group overflow-hidden rounded-md border border-blush/70 bg-white transition-shadow hover:shadow-[0_12px_32px_rgba(107,18,34,0.10)]"
            >
              <div className="relative h-48 overflow-hidden bg-petal">
                <Image
                  src={combo.image}
                  alt={combo.imageAlt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[11px] font-bold text-crimson">
                  {combo.tag}
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-text">{combo.name}</h3>
                </div>
                <ul className="mt-3 min-h-[92px] space-y-2 text-sm text-crimson">
                  <li className="flex items-start gap-2">
                    <CheckIcon
                      aria-hidden="true"
                      size={16}
                      className="mt-0.5 shrink-0 text-coral"
                    />
                    {combo.includedToppings} adicionais grátis
                  </li>
                  {combo.includedFruits > 0 && (
                    <li className="flex items-start gap-2">
                      <CheckIcon
                        aria-hidden="true"
                        size={16}
                        className="mt-0.5 shrink-0 text-coral"
                      />
                      {combo.includedFruits}{" "}
                      {combo.includedFruits === 1 ? "fruta" : "frutas"} grátis
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <CheckIcon
                      aria-hidden="true"
                      size={16}
                      className="mt-0.5 shrink-0 text-coral"
                    />
                    {combo.includedExtras}{" "}
                    {combo.includedExtras === 1
                      ? "extra grátis"
                      : "extras grátis"}
                  </li>
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-petal pt-3">
                  <span className="text-base font-extrabold text-crimson">
                    {combo.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChooseCombo(combo)}
                    aria-label={`Personalizar ${combo.name}`}
                    className="flex h-9 items-center gap-1.5 rounded-md bg-crimson px-3 text-xs font-bold text-white transition-colors hover:bg-dark"
                  >
                    Personalizar <ArrowRightIcon aria-hidden="true" size={15} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-blush/70 pt-6 sm:flex-row sm:items-center">
        <p className="text-sm text-crimson sm:text-base">
          Encontrou seu favorito? Peça direto com a gente.
        </p>
        <a
          href="#monte-seu-acai"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-crimson px-5 text-sm font-bold text-white transition-colors hover:bg-dark sm:w-auto"
        >
          Personalizar meu pedido
          <ArrowRightIcon aria-hidden="true" size={18} />
        </a>
      </div>
    </section>
  );
}
