"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import {
  currency,
  deliveryFee,
  type BuilderExtra,
  type CondimentPosition,
} from "@/components/menu/acai-builder-data";
import type { MenuCombo } from "@/components/menu/menu-data";

type OrderSummaryProps = {
  selectedCombo: MenuCombo | null;
  flavorName: string | null;
  sizeName: string | null;
  comboPrice: number;
  total: number;
  selectedToppingCount: number;
  sauceSummary: string;
  condimentPosition: CondimentPosition | null;
  selectedFruitCount: number;
  toppingsTotal: number;
  fruitsTotal: number;
  selectedExtras: BuilderExtra[];
  extrasAllowance: number;
  checkoutStep: 1 | 2;
  onContinueToDelivery: () => void;
};

export function OrderSummary({
  selectedCombo,
  flavorName,
  sizeName,
  comboPrice,
  total,
  selectedToppingCount,
  sauceSummary,
  condimentPosition,
  selectedFruitCount,
  toppingsTotal,
  fruitsTotal,
  selectedExtras,
  extrasAllowance,
  checkoutStep,
  onContinueToDelivery,
}: OrderSummaryProps) {
  const [summaryReached, setSummaryReached] = useState(false);
  const summaryRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let frame = 0;

    function updateSummaryVisibility() {
      const summaryTop = summaryRef.current?.getBoundingClientRect().top;
      if (summaryTop !== undefined) {
        setSummaryReached(summaryTop <= window.innerHeight);
      }
    }

    function scheduleUpdate() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateSummaryVisibility);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <>
      <aside
        ref={summaryRef}
        id="order-summary"
        className="h-fit bg-dark p-5 text-white sm:p-6 lg:sticky lg:top-24"
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blush">
          {selectedCombo ? selectedCombo.name : "Açaí livre"}
        </p>
        <h3 className="mt-2 text-2xl font-black">Do jeitinho que você gosta</h3>
        <div className="mt-6 space-y-3 border-b border-white/20 pb-5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-blush">Sabor</span>
            <span>{flavorName ?? "a escolher"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-blush">Tamanho</span>
            <span>{sizeName ?? "a escolher"}</span>
          </div>
          {sizeName && (
            <div className="flex justify-between gap-4">
              <span className="text-blush">Preço base</span>
              <span>{currency.format(comboPrice)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-blush">Acompanhamentos</span>
            <span>{selectedToppingCount} selecionado(s)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-blush">Caldas</span>
            <span>{sauceSummary}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-blush">Posição dos condimentos</span>
            <span>
              {condimentPosition
                ? `${condimentPosition.name}${condimentPosition.price > 0 ? ` · + ${currency.format(condimentPosition.price)}` : " · incluído"}`
                : "a escolher"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-blush">Frutas</span>
            <span>{selectedFruitCount} selecionada(s)</span>
          </div>
          {toppingsTotal > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-blush">Acompanhamentos adicionais</span>
              <span>+ {currency.format(toppingsTotal)}</span>
            </div>
          )}
          {fruitsTotal > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-blush">Frutas adicionais</span>
              <span>+ {currency.format(fruitsTotal)}</span>
            </div>
          )}
          {selectedExtras.map((item, index) => (
            <div key={item.id} className="flex justify-between gap-4">
              <span className="text-blush">{item.name}</span>
              <span>
                {index < extrasAllowance
                  ? "grátis"
                  : `+ ${currency.format(item.price)}`}
              </span>
            </div>
          ))}
          <div className="flex justify-between gap-4">
            <span className="text-blush">Taxa de entrega</span>
            <span>{currency.format(deliveryFee)}</span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 py-5">
          <span className="text-sm font-semibold text-blush">
            Total estimado
          </span>
          <output aria-live="polite" className="text-3xl font-black text-white">
            {currency.format(total)}
          </output>
        </div>
        {checkoutStep === 1 && (
          <button
            type="button"
            onClick={onContinueToDelivery}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-crimson px-4 text-sm font-extrabold text-white transition-colors hover:bg-dark"
          >
            Continuar para entrega
            <ArrowRightIcon aria-hidden="true" size={17} />
          </button>
        )}
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-blush">
          <CheckIcon aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
          {checkoutStep === 1
            ? "Na próxima etapa você informa endereço e forma de pagamento."
            : "Confira os dados e envie seu pedido pelo WhatsApp."}
        </p>
      </aside>

      {!summaryReached && (
        <a
          href="#order-summary"
          aria-label={`Valor atual ${currency.format(total)}. Toque para ver os detalhes do pedido.`}
          className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-40 flex min-h-[68px] items-center justify-between gap-4 rounded-md bg-dark px-5 py-3 text-white shadow-[0_8px_28px_rgba(61,15,26,0.28)] md:hidden"
        >
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-blush">
              Valor atual · ver detalhes
            </span>
            <span className="block truncate text-sm font-bold">
              {selectedCombo ? selectedCombo.name : "Açaí livre"}
            </span>
          </span>
          <output
            aria-live="polite"
            className="shrink-0 text-xl font-black text-white"
          >
            {currency.format(total)}
          </output>
        </a>
      )}
    </>
  );
}
