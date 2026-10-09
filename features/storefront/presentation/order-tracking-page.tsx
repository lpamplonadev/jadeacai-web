"use client";

import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  CheckIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
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

const statusDescriptions: Record<OrderStatus, string> = {
  received: "Seu pedido foi registrado e a loja já recebeu a solicitação.",
  preparing: "A loja está preparando seu pedido agora.",
  ready: "Seu pedido está pronto para a próxima etapa.",
  out_for_delivery: "Seu pedido saiu da loja e está a caminho.",
  delivered: "Seu pedido foi entregue. Esperamos que aproveite!",
  completed: "Pedido concluído. Obrigado por pedir na Jade's Açaí.",
};

export function OrderTrackingPage({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [error, setError] = useState<"not-found" | "unavailable" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isComplete = order?.status === "completed";

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
    const interval = isComplete
      ? null
      : window.setInterval(() => void refreshOrder(), 15_000);

    return () => {
      active = false;
      if (interval !== null) window.clearInterval(interval);
    };
  }, [isComplete, orderId]);

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
            <div
              aria-live="polite"
              className="rounded-md border border-blush/70 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-crimson/70">
                    Pedido #{order.orderNumber} · {order.orderDate}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-crimson">
                    {orderSteps[currentStep]?.label ?? "Status atualizado"}
                  </h2>
                </div>
                {!isComplete && (
                  <span
                    className={`inline-flex min-h-8 items-center gap-2 rounded-full px-3 text-xs font-extrabold ${error === "unavailable" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}
                  >
                    {error === "unavailable" ? (
                      <CircleNotchIcon
                        aria-hidden="true"
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
                      </span>
                    )}
                    {error === "unavailable"
                      ? "Reconectando"
                      : "Acompanhamento ativo"}
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-start gap-3 border-t border-blush/50 pt-4">
                {error === "unavailable" ? (
                  <CircleNotchIcon
                    aria-hidden="true"
                    size={22}
                    className="mt-0.5 shrink-0 animate-spin text-amber-700"
                  />
                ) : (
                  <CheckCircleIcon
                    aria-hidden="true"
                    size={22}
                    weight="fill"
                    className="mt-0.5 shrink-0 text-emerald-700"
                  />
                )}
                <div>
                  <p className="text-sm font-extrabold text-crimson">
                    {error === "unavailable"
                      ? "Estamos tentando atualizar"
                      : isComplete
                        ? "Tudo certo com seu pedido"
                        : "Tudo certo, seguimos acompanhando"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-crimson/75">
                    {error === "unavailable"
                      ? "Este é o último status recebido. Assim que a conexão voltar, buscamos a próxima atualização."
                      : statusDescriptions[order.status]}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-blush/50 pt-3 text-xs text-crimson/60">
                <p>Pedido feito em {createdAt}</p>
                {lastUpdated && (
                  <p>
                    Atualizado às {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    {!isComplete && error !== "unavailable" &&
                      " · consulta automática a cada 15 s"}
                  </p>
                )}
              </div>
            </div>

            <ol
              className="mt-7 space-y-4"
              aria-label="Etapas do pedido"
            >
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
          </section>
        )}

        {!order && isLoading && (
          <div role="status" className="mt-8 animate-pulse">
            <p className="text-sm font-bold text-crimson">
              Conectando à loja...
            </p>
            <p className="mt-2 text-sm text-crimson/70">
              Estamos buscando o status mais recente do seu pedido.
            </p>
            <div className="mt-5 h-20 rounded-md bg-white ring-1 ring-blush/60" />
          </div>
        )}
        {!order && !isLoading && error === "not-found" && (
          <p role="alert" className="mt-8 text-sm font-semibold text-crimson">
            Não encontramos esse pedido. Confira se o link está correto.
          </p>
        )}
        {!order && !isLoading && error === "unavailable" && (
          <div role="status" className="mt-8 flex items-start gap-3 text-crimson">
            <CircleNotchIcon
              aria-hidden="true"
              size={20}
              className="mt-0.5 shrink-0 animate-spin"
            />
            <div>
              <p className="text-sm font-bold">Conexão instável</p>
              <p className="mt-1 text-sm text-crimson/70">
                Estamos tentando consultar seu pedido novamente.
              </p>
            </div>
          </div>
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