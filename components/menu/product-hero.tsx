import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import type { MenuCombo, Product } from "@/components/menu/menu-data";

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
  onSelectSlide: (index: number) => void;
  onChangeSlide: (direction: number) => void;
};

export function ProductHero({
  activeSlide,
  products,
  combos,
  onSelectSlide,
  onChangeSlide,
}: ProductHeroProps) {
  const promotions: HeroPromotion[] = [
    {
      name: "Açaí livre de banana",
      badge: "Açaí livre",
      headline: "Seu açaí,",
      highlight: "seu jeito.",
      description:
        "Escolha açaí de banana ou morango, até 6 acompanhamentos e 1 fruta incluídos. Personalize e veja o valor antes de pedir.",
      ctaLabel: "Montar meu açaí",
      href: "#monte-seu-acai",
      priceLabel: "Copos a partir de R$ 11,90",
      image: products[0].image,
      imageAlt: products[0].imageAlt,
      imageBadge: "Até 6 acompanhamentos incluídos",
    },
    {
      name: "Açaí livre de morango",
      badge: "Monte do seu jeito",
      headline: "Escolha cada",
      highlight: "detalhe.",
      description:
        "Combine os sabores de açaí, acompanhamentos, calda, frutas e extras no montador.",
      ctaLabel: "Personalizar meu açaí",
      href: "#monte-seu-acai",
      priceLabel: "Açaí livre a partir de R$ 11,90",
      image: products[1].image,
      imageAlt: products[1].imageAlt,
      imageBadge: "Banana ou morango",
    },
    ...combos.slice(0, 2).map((combo) => ({
      name: combo.name,
      badge: combo.tag,
      headline:
        combo.includedFruits > 0
          ? `${combo.name}, com fruta`
          : `${combo.name} pra começar`,
      highlight: `por ${combo.price}.`,
      description: [
        `${combo.includedToppings} adicionais grátis`,
        ...(combo.includedFruits > 0
          ? [
              `${combo.includedFruits} ${combo.includedFruits === 1 ? "fruta" : "frutas"} grátis`,
            ]
          : []),
        `${combo.includedExtras} extra grátis`,
      ].join(" + "),
      ctaLabel: `Ver ${combo.name}`,
      href: "#catalogo",
      priceLabel: `${combo.size} · ${combo.price}`,
      image: combo.image,
      imageAlt: combo.imageAlt,
      imageBadge: [
        `${combo.includedToppings} adicionais grátis`,
        ...(combo.includedFruits > 0
          ? [
              `${combo.includedFruits} ${combo.includedFruits === 1 ? "fruta" : "frutas"}`,
            ]
          : []),
        `${combo.includedExtras} extra grátis`,
      ].join(" · "),
    })),
  ];

  const promotion = promotions[activeSlide] ?? promotions[0];

  return (
    <section
      aria-label="Destaques do cardápio"
      className="relative overflow-hidden border-b border-blush/50 bg-gradient-to-b from-crimson/75 to-crimson sm:bg-gradient-to-l from-crimson/75 to-crimson"
    >
      <div className="mx-auto grid min-h-[530px] max-w-7xl items-center gap-8 px-5 py-10 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:py-14">
        <div className="relative z-10 order-2 pb-2 md:order-1 md:py-8">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-petal sm:text-sm">
            <span className="h-px w-8 bg-petal" />
            {activeSlide < 2
              ? "Açaí livre · monte sua combinação"
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
            <a
              href={promotion.href}
              className="inline-flex min-h-12 items-center gap-3 rounded-md bg-petal px-5 text-sm font-bold text-dark transition-colors hover:bg-dark hover:text-blush shadow-sm"
            >
              {promotion.ctaLabel}{" "}
              <ArrowRightIcon aria-hidden="true" size={18} />
            </a>
            <span className="text-sm font-semibold text-muted">
              {promotion.priceLabel}
            </span>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <div
              className="flex items-center gap-1.5"
              aria-label={`Destaque ${activeSlide + 1} de ${promotions.length}`}
            >
              {promotions.map((item, index) => (
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

        <div className="relative order-1 mx-auto h-[270px] w-full max-w-xl md:order-2 md:h-[430px]">
          <div className="absolute inset-0 overflow-hidden rounded-md bg-blush">
            <Image
              key={promotion.image}
              src={promotion.image}
              alt={promotion.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="eager"
              className="h-full w-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/25 via-transparent to-transparent" />
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-md bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:bottom-6 sm:left-6">
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
          <span className="absolute right-4 top-4 rounded-full bg-coral px-3 py-1.5 text-xs font-bold text-white sm:right-6 sm:top-6">
            {promotion.imageBadge}
          </span>
        </div>
      </div>
    </section>
  );
}
