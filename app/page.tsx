"use client";

import { useEffect, useState } from "react";
import { AcaiBuilder } from "@/components/menu/acai-builder";
import {
  currency,
  type BuilderCatalogData,
} from "@/components/menu/acai-builder-data";
import { BrandFooter } from "@/components/menu/brand-footer";
import { combos, products, type MenuCombo } from "@/components/menu/menu-data";
import { ProductCatalog } from "@/components/menu/product-catalog";
import { ProductHero } from "@/components/menu/product-hero";
import { SiteHeader } from "@/components/menu/site-header";
import { getApiHealth, getPublicCatalog, toBuilderCatalog } from "@/lib/jade-api";

type ApiStatus = "checking" | "online" | "offline";

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCombo, setSelectedCombo] = useState<MenuCombo | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [sizeSelectionRequest, setSizeSelectionRequest] = useState(0);
  const [menuCombos, setMenuCombos] = useState<MenuCombo[]>([]);
  const [builderCatalog, setBuilderCatalog] = useState<BuilderCatalogData | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [catalogError, setCatalogError] = useState(false);
  const heroSlideCount = 2 + Math.min(2, menuCombos.length);

  useEffect(() => {
    let active = true;

    async function loadApiData() {
      const [healthResult, catalogResult] = await Promise.allSettled([
        getApiHealth(),
        getPublicCatalog(),
      ]);

      if (!active) return;

      setApiStatus(
        healthResult.status === "fulfilled" &&
          healthResult.value.status === "ok"
          ? "online"
          : "offline",
      );

      if (catalogResult.status === "fulfilled") {
        const catalog = catalogResult.value;
        setMenuCombos(
          catalog.combos.map((combo, index) => {
            const visual = combos.find((item) => item.id === combo.key);
            return {
              ...combo,
              price: currency.format(combo.priceCents / 100),
              image: combo.image || visual?.image || products[index % products.length].image,
              imageAlt: combo.imageAlt || visual?.imageAlt || combo.name,
            };
          }),
        );
        setBuilderCatalog(toBuilderCatalog(catalog));
        setCatalogError(false);
      } else {
        setMenuCombos([]);
        setBuilderCatalog(null);
        setCatalogError(true);
      }
    }

    void loadApiData();
    return () => {
      active = false;
    };
  }, []);

  function changeSlide(direction: number) {
    setActiveSlide(
      (current) => (current + direction + heroSlideCount) % heroSlideCount,
    );
  }

  function chooseCombo(combo: MenuCombo) {
    setSelectedCombo(combo);
    setSelectedSizeId(null);
    document
      .getElementById("monte-seu-acai")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function chooseFreeSize(sizeId: string) {
    setSelectedCombo(null);
    setSelectedSizeId(sizeId);
    setSizeSelectionRequest((request) => request + 1);
    document
      .getElementById("monte-seu-acai")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-cream text-text">
      <SiteHeader />

      <main id="inicio">
        <ProductHero
          activeSlide={activeSlide}
          products={products}
          combos={menuCombos}
          catalog={builderCatalog}
          onSelectSlide={setActiveSlide}
          onChangeSlide={changeSlide}
        />
        {builderCatalog && (
          <ProductCatalog
            combos={menuCombos}
            catalog={builderCatalog}
            products={products}
            onChooseCombo={chooseCombo}
            onChooseSize={chooseFreeSize}
            apiStatus={apiStatus}
            catalogError={catalogError}
          />
        )}
        {builderCatalog ? (
          <AcaiBuilder
            selectedCombo={selectedCombo}
            initialSizeId={selectedSizeId}
            sizeSelectionRequest={sizeSelectionRequest}
            onClearCombo={() => setSelectedCombo(null)}
            catalog={builderCatalog}
          />
        ) : (
          <section
            id="monte-seu-acai"
            role="status"
            className="bg-petal px-5 py-14 text-center text-sm font-semibold text-crimson"
          >
            {catalogError
              ? "Não foi possível carregar o cardápio agora. Tente novamente em instantes."
              : "Carregando opções do cardápio..."}
          </section>
        )}
        <BrandFooter />
      </main>
    </div>
  );
}
