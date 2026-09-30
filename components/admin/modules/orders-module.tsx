"use client";

import { ArrowClockwiseIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent } from "react";

type AdminOrder = {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  estimatedTotalCents: number;
  orderData: unknown;
  createdAt: string;
};

type OrdersResponse = {
  orders: AdminOrder[];
  page: number;
  limit: number;
  total: number;
};

const orderStatuses = [
  { value: "received", label: "Recebidos" },
  { value: "preparing", label: "Em preparo" },
  { value: "ready", label: "Prontos" },
  { value: "out_for_delivery", label: "Saiu para entrega" },
  { value: "delivered", label: "Entregues" },
  { value: "completed", label: "Concluídos" },
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatStatus(status: string) {
  return orderStatuses.find((item) => item.value === status)?.label ?? status;
}

export function OrdersModule() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 20;

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      setLoading(true);
      setError("");
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) query.set("status", status);
      if (search) query.set("search", search);

      try {
        const response = await fetch(`/admin/api/orders?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Não foi possível carregar os pedidos.");

        const result = (await response.json()) as OrdersResponse;
        setOrders(result.orders);
        setTotal(result.total);
      } catch {
        if (!controller.signal.aborted) {
          setOrders([]);
          setTotal(0);
          setError("Não foi possível carregar os pedidos. Verifique a API e tente novamente.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadOrders();
    return () => controller.abort();
  }, [page, status, search, refreshKey]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  const firstOrder = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastOrder = Math.min(page * limit, total);

  return (
    <section id="pedidos" aria-labelledby="orders-title" className="scroll-mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="orders-title" className="text-xl font-black">
            Pedidos
          </h2>
          <p className="mt-1 text-sm text-[#77776e]">
            Consulte pedidos recebidos e acompanhe cada etapa da operação.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#d6d6ce] bg-white px-3 text-sm font-bold text-[#48483f] transition-colors hover:border-[#8b1a2e] hover:text-[#8b1a2e] disabled:cursor-wait disabled:opacity-60"
        >
          <ArrowClockwiseIcon aria-hidden="true" size={17} />
          Atualizar
        </button>
      </div>

      <form
        onSubmit={submitSearch}
        className="mb-4 flex flex-col gap-3 border-y border-[#deded7] py-3 sm:flex-row"
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Buscar por cliente ou telefone</span>
          <MagnifyingGlassIcon
            aria-hidden="true"
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#77776e]"
          />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nome ou telefone"
            className="min-h-10 w-full rounded-md border border-[#d6d6ce] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#8b1a2e]"
          />
        </label>
        <label className="sr-only" htmlFor="orders-status-filter">
          Filtrar pedidos por status
        </label>
        <select
          id="orders-status-filter"
          value={status}
          onChange={(event) => {
            setPage(1);
            setStatus(event.target.value);
          }}
          className="min-h-10 rounded-md border border-[#d6d6ce] bg-white px-3 text-sm outline-none focus:border-[#8b1a2e]"
        >
          <option value="">Todos os status</option>
          {orderStatuses.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="min-h-10 rounded-md bg-[#8b1a2e] px-4 text-sm font-bold text-white transition-colors hover:bg-[#6b1222]"
        >
          Buscar
        </button>
      </form>

      {error && (
        <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="py-10 text-center text-sm text-[#77776e]">
          Carregando pedidos...
        </p>
      )}
      {!loading && !error && orders.length === 0 && (
        <p className="border border-dashed border-[#d6d6ce] bg-white px-5 py-12 text-center text-sm text-[#77776e]">
          Nenhum pedido encontrado.
        </p>
      )}

      {!loading && orders.length > 0 && (
        <>
          <div className="overflow-x-auto border border-[#deded7] bg-white">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-[#f3f3ef] text-xs uppercase text-[#68685f]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-extrabold">Pedido</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Cliente</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Data</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Total estimado</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Status</th>
                  <th scope="col" className="px-4 py-3 font-extrabold">Dados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e2]">
                {orders.map((order) => (
                  <tr key={order.id} className="align-top hover:bg-[#fcfcfa]">
                    <td className="px-4 py-4 font-mono text-xs text-[#68685f]">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#33332d]">{order.customerName}</p>
                      <p className="mt-1 text-xs text-[#77776e]">{order.customerPhone}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-[#68685f]">
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-bold text-[#33332d]">
                      {currency.format(order.estimatedTotalCents / 100)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-[#f8eeee] px-2.5 py-1 text-xs font-bold text-[#731a2a]">
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <details className="max-w-xs">
                        <summary className="cursor-pointer font-bold text-[#8b1a2e]">
                          Ver pedido
                        </summary>
                        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-[#f3f3ef] p-3 text-xs text-[#33332d]">
                          {JSON.stringify(order.orderData, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm text-[#68685f]">
            <p>
              Mostrando {firstOrder}–{lastOrder} de {total} pedidos
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1 || loading}
                className="min-h-9 rounded-md border border-[#d6d6ce] bg-white px-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((value) => value + 1)}
                disabled={page * limit >= total || loading}
                className="min-h-9 rounded-md border border-[#d6d6ce] bg-white px-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
