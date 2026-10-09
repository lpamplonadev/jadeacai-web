"use client";

import { useEffect, useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import Link from "next/link";
import {
  ApiError,
  getOrderTracking,
} from "@/features/storefront/infrastructure/api-client";
import type {
  OrderStatus,
  OrderTracking as OrderTrackingData,
} from "@/features/storefront/domain/order";

const orderSteps: { status: OrderStatus; label: string }[] = [
  { status: "received", label: "Pedido recebido" },
  { status: "preparing", label: "Em preparo" },
  { status: "ready", label: "Pronto" },
  { status: "out_for_delivery", label: "Saiu para entrega" },
  { status: "delivered", label: "Entregue" },
  { status: "completed", label: "Concluído" },
];

export function OrderTrackingPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [error, setError] = useState<"not-found" | "unavailable" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;

    async function refreshOrder() {
      try {
        const result = await getOrderTracking(orderId);
        if (!active) return;
        setOrder(result);
        setError(null);
        setLastUpdated(new Date());
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof ApiError && requestError.status === 404
            ? "not-found"
            : "unavailable",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void refreshOrder();
    const interval = window.setInterval(() => void refreshOrder(), 15_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [orderId]);

  const currentStep = order
    ? orderSteps.findIndex((step) => step.status === order.status)
    : -1;
  const createdAt = order
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(order.createdAt))
    : null;

  return (
    <main className="min-h-screen bg-cream text-crimson">
      <header className="bg-dark text-cream">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-5">
          <Link
            href="/"
            className="text-xl font-bold"
            style={{ fontFamily: "Pacifico, cursive" }}
          >
            Jade&apos;s Açaí
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
          Acompanhamento
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Status do pedido
        </h1>

        {order && (
          <section className="mt-8 border-y border-blush/80 py-6">
            <div aria-live="polite">
              <p className="text-sm font-bold text-crimson/70">
                Pedido #{order.orderNumber} · {order.orderDate}
              </p>
              <h2 className="mt-2 text-2xl font-black text-crimson">
                {orderSteps[currentStep]?.label ?? "Status atualizado"}
              </h2>
              <p className="mt-2 text-sm text-crimson/70">
                Pedido feito em {createdAt}
              </p>
            </div>

            <ol className="mt-7 space-y-4" aria-label="Etapas do pedido">
              {orderSteps.map((step, index) => {
                const isComplete = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <li
                    key={step.status}
                    aria-current={isCurrent ? "step" : undefined}
                    className="flex items-center gap-3"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${isComplete ? "bg-crimson text-white" : "bg-white text-crimson ring-1 ring-blush"}`}
                    >
                      {index < currentStep ? (
                        <CheckIcon aria-hidden="true" size={16} weight="bold" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={`text-sm ${isCurrent ? "font-extrabold text-crimson" : "font-semibold text-crimson/70"}`}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
            {lastUpdated && (
              <p className="mt-5 text-xs text-crimson/60">
                Atualizado às {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </section>
        )}

        {!order && isLoading && (
          <p role="status" className="mt-8 text-sm text-crimson/70">
            Consultando pedido...
          </p>
        )}
        {!order && !isLoading && error === "not-found" && (
          <p role="alert" className="mt-8 text-sm font-semibold text-crimson">
            Não encontramos esse pedido. Confira se o link está correto.
          </p>
        )}
        {!order && !isLoading && error === "unavailable" && (
          <p role="alert" className="mt-8 text-sm font-semibold text-crimson">
            Não foi possível consultar o pedido agora. Tente abrir este link novamente.
          </p>
        )}
        {order && error === "unavailable" && (
          <p role="status" className="mt-4 text-sm text-crimson/70">
            Não foi possível atualizar agora; exibimos o último status recebido.
          </p>
        )}

        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center text-sm font-bold text-crimson underline underline-offset-4"
        >
          Voltar para a loja
        </Link>
      </div>
    </main>
  );
}