import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import {
  currency,
} from "@/features/storefront/domain/acai-builder-data";
import type { MenuCombo, MenuGourmet, Product } from "@/features/storefront/domain/menu-types";

type HeroPromotion = {
  name: string;
  badge: string;
  headline: string;
  highlight: string;
  description: string;
  ctaLabel: string;
  href: string;
  priceLabel: string;
  image: string;
  imageAlt: string;
  imageBadge: string;
};

type ProductHeroProps = {
  activeSlide: number;
  products: Product[];
  combos: MenuCombo[];
  gourmets: MenuGourmet[];
  storeIsOpen: boolean;
  onSelectSlide: (index: number) => void;
  onChangeSlide: (direction: number) => void;
};

export function ProductHero({
  activeSlide,
  products,
  combos,
  gourmets,
  storeIsOpen,
  onSelectSlide,
  onChangeSlide,
}: ProductHeroProps) {
  const promotions: HeroPromotion[] = [
    ...combos.map((combo) => ({
      name: combo.name,
      badge: combo.tag || "Combo",
      headline: combo.name,
      highlight: "para compartilhar.",
      description: `${combo.includedToppings} acompanhamentos incluídos. Uma combinação completa, pronta para personalizar.`,
      ctaLabel: `Ver ${combo.name}`,
      href: "#catalogo",
      priceLabel: `${combo.size} · ${combo.price}`,
      image: combo.image,
      imageAlt: combo.imageAlt,
      imageBadge: combo.tag,
    })),
    ...gourmets.map((gourmet) => ({
      name: gourmet.name,
      badge: gourmet.tag || "Gourmet",
      headline: gourmet.name,
      highlight: "receita da casa.",
      description: gourmet.description,
      ctaLabel: `Ver ${gourmet.name}`,
      href: "#catalogo",
      priceLabel: gourmet.sizes.length
        ? `A partir de ${currency.format(Math.min(...gourmet.sizes.map((size) => size.priceCents)) / 100)}`
        : "Consulte as opções do cardápio",
      image: gourmet.image,
      imageAlt: gourmet.imageAlt,
      imageBadge: gourmet.tag || "Receita da casa",
    })),
  ];
  const fallbackImage = products[0];
  const fallbackPromotion: HeroPromotion = {
    name: "Cardápio Jade",
    badge: "Feito na hora",
    headline: "Combinações",
    highlight: "da casa.",
    description: "Receitas preparadas com açaí cremoso e ingredientes selecionados.",
    ctaLabel: "Ver cardápio",
    href: "#catalogo",
    priceLabel: "Confira tamanhos e preços",
    image: fallbackImage.image,
    imageAlt: fallbackImage.imageAlt,
    imageBadge: "Cardápio atualizado",
  };
  const slideCount = Math.max(1, promotions.length);
  const promotion = promotions[activeSlide % slideCount] ?? fallbackPromotion;

  return (
    <section
      aria-label="Destaques do cardápio"
      className="relative overflow-hidden border-b border-blush/50 bg-gradient-to-b from-crimson/75 to-crimson sm:bg-gradient-to-l from-crimson/75 to-crimson"
    >
      <div className="mx-auto grid min-h-[530px] max-w-7xl items-center gap-8 px-5 py-10 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-14">
        <div className="relative z-10 order-2 pb-2 md:order-1 md:py-8">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-petal sm:text-sm">
            <span className="h-px w-8 bg-petal" />
            {gourmets.some((gourmet) => gourmet.name === promotion.name)
              ? "Receitas Gourmet Jade"
              : "Combos Jade · escolha o seu"}
          </p>
          <span className="mb-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold text-coral shadow-sm">
            {promotion.badge}
          </span>
          <h1 className="max-w-xl text-4xl font-black leading-[1.03] tracking-tight text-petal sm:text-5xl md:text-6xl">
            {promotion.headline}{" "}
            <span
              className="text-coral"
              style={{
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                fontFamily: "Pacifico, cursive",
              }}
            >
              {promotion.highlight}
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-petal sm:text-lg">
            {promotion.description}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            {storeIsOpen ? (
              <a
                href={promotion.href}
                className="inline-flex min-h-12 items-center gap-3 rounded-md bg-petal px-5 text-sm font-bold text-dark shadow-sm transition-colors hover:bg-dark hover:text-blush"
              >
                {promotion.ctaLabel}{" "}
                <ArrowRightIcon aria-hidden="true" size={18} />
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 cursor-not-allowed items-center gap-3 rounded-md bg-neutral-300 px-5 text-sm font-bold text-neutral-600 opacity-80"
              >
                Loja fechada
              </button>
            )}
            <span className="text-sm font-semibold text-muted">
              {promotion.priceLabel}
            </span>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div
              className="flex items-center gap-1.5"
              aria-label={`Destaque ${activeSlide + 1} de ${slideCount}`}
            >
              {(promotions.length ? promotions : [fallbackPromotion]).map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  aria-label={`Ver destaque: ${item.name}`}
                  aria-current={activeSlide === index ? "true" : undefined}
                  onClick={() => onSelectSlide(index)}
                  className={`h-2 rounded-full transition-all ${activeSlide === index ? "w-8 bg-coral" : "w-2 bg-blush hover:bg-coral/70"}`}
                />
              ))}
            </div>
            <span className="h-5 w-px bg-blush" />
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Produto anterior"
                onClick={() => onChangeSlide(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-blush text-petal transition-colors hover:bg-white"
              >
                <ArrowLeftIcon aria-hidden="true" size={17} />
              </button>
              <button
                type="button"
                aria-label="Próximo produto"
                onClick={() => onChangeSlide(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-blush text-petal transition-colors hover:bg-white"
              >
                <ArrowRightIcon aria-hidden="true" size={17} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative order-1 mx-auto aspect-square w-full max-w-xl md:order-2">
          <div className="absolute inset-0 overflow-hidden rounded-md bg-petal">
            <Image
              key={promotion.image}
              src={promotion.image}
              alt={promotion.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="eager"
              className="h-full w-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/20 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 rounded-md bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:bottom-6 sm:left-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-petal text-crimson">
              <CheckIcon aria-hidden="true" size={20} weight="bold" />
            </span>
            <span>
              <span className="block text-xs text-crimson">Em destaque</span>
              <span className="block text-sm font-bold text-crimson">
                {promotion.name}
              </span>
            </span>
          </div>
          {promotion.imageBadge && (
            <span className="absolute right-4 top-4 z-20 rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-white sm:right-6 sm:top-6">
              {promotion.imageBadge}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
