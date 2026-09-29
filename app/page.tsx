"use client";

import { useEffect, useState } from "react";
import { AcaiBuilder } from "@/components/menu/acai-builder";
import { currency } from "@/components/menu/acai-builder-data";
import { BrandFooter } from "@/components/menu/brand-footer";
import { combos, products, type MenuCombo } from "@/components/menu/menu-data";
import { ProductCatalog } from "@/components/menu/product-catalog";
import { ProductHero } from "@/components/menu/product-hero";
import { SiteHeader } from "@/components/menu/site-header";
import { getApiHealth, getMenuCombos } from "@/lib/jade-api";

type ApiStatus = "checking" | "online" | "offline";

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCombo, setSelectedCombo] = useState<MenuCombo | null>(null);
  const [menuCombos, setMenuCombos] = useState(combos);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");
  const [catalogError, setCatalogError] = useState(false);
  const heroSlideCount = 2 + Math.min(2, menuCombos.length);

  useEffect(() => {
    let active = true;

    async function loadApiData() {
      const [healthResult, combosResult] = await Promise.allSettled([
        getApiHealth(),
        getMenuCombos(),
      ]);

      if (!active) return;

      setApiStatus(
        healthResult.status === "fulfilled" &&
          healthResult.value.status === "ok"
          ? "online"
          : "offline",
      );

      if (combosResult.status === "fulfilled") {
        setMenuCombos(
          combosResult.value.map((combo) => {
            const visual = combos.find((item) => item.id === combo.id);
            return {
              ...combo,
              price: currency.format(combo.priceCents / 100),
              image: visual?.image ?? products[0].image,
              imageAlt: visual?.imageAlt ?? combo.name,
            };
          }),
        );
        setCatalogError(false);
      } else {
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
          onSelectSlide={setActiveSlide}
          onChangeSlide={changeSlide}
        />
        <ProductCatalog
          combos={menuCombos}
          onChooseCombo={chooseCombo}
          apiStatus={apiStatus}
          catalogError={catalogError}
        />
        <AcaiBuilder
          selectedCombo={selectedCombo}
          onClearCombo={() => setSelectedCombo(null)}
        />
        <BrandFooter />
      </main>
    </div>
  );
}
