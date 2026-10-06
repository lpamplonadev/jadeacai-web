"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import {
  currency,
  type BuilderExtra,
  type CondimentPosition,
} from "@/features/storefront/domain/acai-builder-data";
import type { MenuOrderProduct } from "@/features/storefront/domain/menu-types";

export type CartSummaryItem = {
  id: string;
  name: string;
  description: string;
  subtotalCents: number;
};

type OrderSummaryProps = {
  selectedCombo: MenuOrderProduct | null;
  comboServingNumber: number;
  comboServingCount: number;
  cartItems: CartSummaryItem[];
  cartSubtotal: number;
  hasCurrentConfiguration: boolean;
  currentHasSelections: boolean;
  canAddToCart: boolean;
  storeIsOpen: boolean;
  onAddToCart: () => void;
  onClearCurrent: () => void;
  onRemoveCartItem: (id: string) => void;
  flavorName: string | null;
  sizeName: string | null;
  comboPrice: number;
  deliveryFee: number;
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
  comboServingNumber,
  comboServingCount,
  cartItems,
  cartSubtotal,
  hasCurrentConfiguration,
  currentHasSelections,
  canAddToCart,
  storeIsOpen,
  onAddToCart,
  onClearCurrent,
  onRemoveCartItem,
  flavorName,
  sizeName,
  comboPrice,
  deliveryFee,
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
          {cartItems.length > 0
            ? `Sacola · ${cartItems.length} ${cartItems.length === 1 ? "item" : "itens"}`
            : (selectedCombo?.name ?? "Selecione um produto")}
        </p>
        <h3 className="mt-2 text-2xl font-black">
          {cartItems.length > 0 ? "Seu pedido" : "Do jeitinho que você gosta"}
        </h3>
        {cartItems.length > 0 && (
          <section
            aria-label="Itens do carrinho"
            className="mt-5 border-b border-white/20 pb-5"
          >
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="mt-1 text-xs leading-5 text-blush">
                      {item.description}
                    </p>
                    <p className="mt-1 text-xs font-bold text-white">
                      {currency.format(item.subtotalCents / 100)}
                    </p>
                  </div>
                  {checkoutStep === 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveCartItem(item.id)}
                      aria-label={`Remover ${item.name} do carrinho`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-blush hover:bg-white/10 hover:text-white"
                    >
                      <XIcon aria-hidden="true" size={17} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {hasCurrentConfiguration && (
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
          </div>
        )}
        {cartItems.length > 0 && (
          <div className="mb-4 flex justify-between gap-4 text-sm">
            <span className="text-blush">Subtotal do carrinho</span>
            <span>{currency.format(cartSubtotal)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4 border-t border-white/20 pt-4 text-sm">
          <span className="text-blush">Taxa de entrega</span>
          <span>{currency.format(deliveryFee)}</span>
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
          <div className="space-y-2">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={!storeIsOpen || !canAddToCart}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-blush px-4 text-sm font-extrabold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selectedCombo && comboServingCount > 1
                ? `Adicionar porção ${comboServingNumber} de ${comboServingCount}`
                : "Adicionar ao carrinho"}
            </button>
            {cartItems.length > 0 && currentHasSelections && (
              <button
                type="button"
                onClick={onClearCurrent}
                className="min-h-10 w-full rounded-md text-xs font-bold text-blush underline underline-offset-2 hover:text-white"
              >
                Descartar configuração atual
              </button>
            )}
            <button
              type="button"
              onClick={onContinueToDelivery}
              disabled={!storeIsOpen || (cartItems.length === 0 && !canAddToCart)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-crimson px-4 text-sm font-extrabold text-white transition-colors hover:bg-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selectedCombo && comboServingNumber < comboServingCount
                ? "Adicionar e configurar próxima porção"
                : cartItems.length > 0
                  ? "Continuar para entrega"
                  : "Adicionar e continuar"}
              <ArrowRightIcon aria-hidden="true" size={17} />
            </button>
          </div>
        )}
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-blush">
          <CheckIcon aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
          {!storeIsOpen
            ? "A loja está fechada; pedidos estão pausados."
            : checkoutStep === 1
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
              {cartItems.length > 0
                ? `Sacola · ${cartItems.length} ${cartItems.length === 1 ? "item" : "itens"}`
                : (selectedCombo?.name ?? "Selecione um produto")}
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
