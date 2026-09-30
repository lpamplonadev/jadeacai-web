"use client";

import { ArrowClockwiseIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  formatOrderDate,
  formatOrderNumber,
  orderStatuses,
} from "@/components/admin/modules/order-details-dialog";

type DashboardResponse = {
  date: string;
  ordersToday: number;
  waitingPreparation: number;
  inProduction: number;
  completedToday: number;
  statusCounts: { status: string; count: number }[];
  recentOrders: {
    id: string;
    orderNumber: number;
    orderDate: string;
    status: string;
    customerName: string;
    estimatedTotalCents: number;
    createdAt: string;
  }[];
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const statusChartColors: Record<string, string> = {
  received: "#8b1a2e",
  preparing: "#d97706",
  ready: "#059669",
  out_for_delivery: "#0284c7",
  delivered: "#0d9488",
  completed: "#64748b",
};

function formatStatus(status: string) {
  return orderStatuses.find((item) => item.value === status)?.label ?? status;
}

export function DashboardModule() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [date, setDate] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setLoading(true);
      setError("");
      const query = date ? `?date=${encodeURIComponent(date)}` : "";

      try {
        const response = await fetch(`/admin/api/dashboard${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar o dashboard.");
        setDashboard((await response.json()) as DashboardResponse);
      } catch {
        if (!controller.signal.aborted) {
          setDashboard(null);
          setError("Não foi possível carregar os indicadores. Verifique a API e tente novamente.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, [date, refreshKey]);

  const counts = new Map(
    (dashboard?.statusCounts ?? []).map((item) => [item.status, item.count]),
  );
  const chartSegments = orderStatuses
    .map((status) => ({
      ...status,
      count: counts.get(status.value) ?? 0,
      color: statusChartColors[status.value],
    }))
    .filter((segment) => segment.count > 0);
  const totalStatuses = chartSegments.reduce((total, segment) => total + segment.count, 0);
  let chartOffset = 0;
  const chartGradient = chartSegments
    .map((segment) => {
      const start = totalStatuses === 0 ? 0 : (chartOffset / totalStatuses) * 100;
      chartOffset += segment.count;
      const end = (chartOffset / totalStatuses) * 100;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(", ");

  const metrics = [
    { label: "Pedidos no dia", value: dashboard?.ordersToday },
    { label: "Aguardando preparo", value: dashboard?.waitingPreparation },
    { label: "Em produção", value: dashboard?.inProduction },
    { label: "Concluídos no dia", value: dashboard?.completedToday },
  ];

  return (
    <section id="dashboard" aria-labelledby="dashboard-title" className="scroll-mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="dashboard-title" className="text-base font-extrabold">
            {dashboard ? formatOrderDate(dashboard.date) : "Dashboard"}
          </h2>
          <p className="mt-1 text-xs text-[#77776e]">
            Indicadores e distribuição dos pedidos por etapa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="dashboard-date">
            Filtrar indicadores por dia
          </label>
          <input
            id="dashboard-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="min-h-10 rounded-md border border-[#d6d6ce] bg-white px-3 text-sm outline-none focus:border-[#8b1a2e]"
          />
          {date && (
            <button
              type="button"
              onClick={() => setDate("")}
              className="min-h-10 rounded-md border border-[#d6d6ce] bg-white px-3 text-sm font-bold text-[#55554e] hover:border-[#8b1a2e] hover:text-[#8b1a2e]"
            >
              Hoje
            </button>
          )}
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={loading}
            aria-label="Atualizar dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d6d6ce] bg-white text-[#48483f] hover:border-[#8b1a2e] hover:text-[#8b1a2e] disabled:opacity-50"
          >
            <ArrowClockwiseIcon aria-hidden="true" size={17} />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <article key={metric.label} className="border border-[#e2e2dc] bg-white p-4">
            <p className="text-xs font-bold text-[#73736a]">{metric.label}</p>
            <p className={`mt-3 text-3xl font-black ${index === 1 ? "text-[#a34b29]" : "text-[#292923]"}`}>
              {loading ? "—" : (metric.value ?? 0)}
            </p>
            <p className="mt-2 text-[11px] leading-4 text-[#898980]">
              {dashboard ? formatOrderDate(dashboard.date) : "Dados do banco de pedidos"}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="border border-[#e2e2dc] bg-white">
          <div className="border-b border-[#e8e8e2] px-4 py-4 sm:px-5">
            <h3 className="font-extrabold">Pedidos recentes</h3>
            <p className="mt-1 text-xs text-[#77776e]">Últimos pedidos do dia selecionado</p>
          </div>
          {loading ? (
            <p role="status" className="px-5 py-10 text-center text-sm text-[#77776e]">
              Carregando pedidos...
            </p>
          ) : dashboard?.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                <thead className="bg-[#f3f3ef] text-xs uppercase text-[#68685f]">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-extrabold">Pedido</th>
                    <th scope="col" className="px-4 py-3 font-extrabold">Cliente</th>
                    <th scope="col" className="px-4 py-3 font-extrabold">Etapa</th>
                    <th scope="col" className="px-4 py-3 font-extrabold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e2]">
                  {dashboard.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-[#8b1a2e]">
                        {formatOrderNumber(order.orderNumber)}
                      </td>
                      <td className="px-4 py-3 font-semibold">{order.customerName}</td>
                      <td className="px-4 py-3 text-xs">{formatStatus(order.status)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-bold">
                        {currency.format(order.estimatedTotalCents / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-[#77776e]">
              {error ? "Os pedidos recentes estão indisponíveis." : "Nenhum pedido neste dia."}
            </p>
          )}
        </section>

        <section className="border border-[#e2e2dc] bg-white">
          <div className="border-b border-[#e8e8e2] px-4 py-4">
            <h3 className="font-extrabold">Distribuição por etapa</h3>
            <p className="mt-1 text-xs text-[#77776e]">Pedidos do dia selecionado</p>
          </div>
          {loading ? (
            <p role="status" className="px-4 py-10 text-center text-sm text-[#77776e]">
              Calculando distribuição...
            </p>
          ) : (
            <div className="flex flex-col items-center gap-5 px-4 py-5 sm:flex-row xl:flex-col 2xl:flex-row">
              <div
                role="img"
                aria-label={`Distribuição de ${totalStatuses} pedidos por etapa`}
                className="relative h-40 w-40 shrink-0 rounded-full"
                style={{
                  background:
                    totalStatuses > 0
                      ? `conic-gradient(${chartGradient})`
                      : "conic-gradient(#e5e7eb 0% 100%)",
                }}
              >
                <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-2xl font-black text-[#292923]">{totalStatuses}</span>
                  <span className="text-[10px] font-bold text-[#77776e]">PEDIDOS</span>
                </div>
              </div>
              <ul className="w-full space-y-2">
                {orderStatuses.map((status) => {
                  const count = counts.get(status.value) ?? 0;
                  return (
                    <li key={status.value} className="flex items-center justify-between gap-3 text-xs">
                      <span className="flex min-w-0 items-center gap-2 font-semibold text-[#55554e]">
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: statusChartColors[status.value] }}
                        />
                        <span className="truncate">{status.label}</span>
                      </span>
                      <span className="font-bold tabular-nums text-[#292923]">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
