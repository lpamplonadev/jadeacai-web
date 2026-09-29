"use client";

import { useState } from "react";
import { AcaiBuilder } from "@/components/menu/acai-builder";
import { BrandFooter } from "@/components/menu/brand-footer";
import { combos, products, type MenuCombo } from "@/components/menu/menu-data";
import { ProductCatalog } from "@/components/menu/product-catalog";
import { ProductHero } from "@/components/menu/product-hero";
import { SiteHeader } from "@/components/menu/site-header";

const heroSlideCount = 4;

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCombo, setSelectedCombo] = useState<MenuCombo | null>(null);

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
          combos={combos}
          onSelectSlide={setActiveSlide}
          onChangeSlide={changeSlide}
        />
        <ProductCatalog combos={combos} onChooseCombo={chooseCombo} />
        <AcaiBuilder
          selectedCombo={selectedCombo}
          onClearCombo={() => setSelectedCombo(null)}
        />
        <BrandFooter />
      </main>
    </div>
  );
}
