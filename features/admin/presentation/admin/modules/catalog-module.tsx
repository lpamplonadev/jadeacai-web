"use client";

import {
  ArrowClockwiseIcon,
  ArchiveBoxIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { requestAdminApi } from "@/features/admin/infrastructure/admin-api";
import {
  CatalogEditorDialog,
  catalogKindLabels,
} from "@/features/admin/presentation/admin/modules/catalog-editor-dialog";
import type {
  CatalogCombo,
  CatalogEditor,
  CatalogItem,
  CatalogItemKind,
} from "@/features/admin/domain/catalog";

type CatalogData = {
  items: CatalogItem[];
  combos: CatalogCombo[];
  rules: { key: string; value: unknown }[];
};

type CatalogTab = "items" | "combos";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

async function readAPIError(response: Response) {
  const result = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return result?.error ?? `A API respondeu com erro (${response.status}).`;
}

export function CatalogModule() {
  const [catalog, setCatalog] = useState<CatalogData>({
    items: [],
    combos: [],
    rules: [],
  });
  const [tab, setTab] = useState<CatalogTab>("items");
  const [kindFilter, setKindFilter] = useState<"all" | CatalogItemKind>("all");
  const [editor, setEditor] = useState<CatalogEditor | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      setLoading(true);
      setError("");
      try {
        const response = await requestAdminApi("/catalog", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(await readAPIError(response));
        setCatalog((await response.json()) as CatalogData);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar o catálogo.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCatalog();
    return () => controller.abort();
  }, [reloadKey]);

  async function mutate(key: string, path: string, init: RequestInit) {
    setMutating(key);
    setError("");
    try {
      const response = await requestAdminApi(path, init);
      if (!response.ok) throw new Error(await readAPIError(response));
      setReloadKey((value) => value + 1);
      return true;
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Não foi possível salvar a alteração.",
      );
      return false;
    } finally {
      setMutating("");
    }
  }

  async function toggleItem(item: CatalogItem) {
    await mutate(`item-${item.id}`, `/catalog/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
  }

  async function archiveItem(item: CatalogItem) {
    if (
      !window.confirm(
        `Excluir “${item.name}” do catálogo? O registro será arquivado para preservar combos e histórico.`,
      )
    )
      return;
    await mutate(`item-${item.id}`, `/catalog/items/${item.id}`, {
      method: "DELETE",
    });
  }

  async function toggleCombo(combo: CatalogCombo) {
    await mutate(`combo-${combo.id}`, `/catalog/combos/${combo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !combo.available }),
    });
  }

  async function archiveCombo(combo: CatalogCombo) {
    if (
      !window.confirm(
        `Excluir “${combo.name}” do catálogo? O registro será arquivado para preservar o histórico.`,
      )
    )
      return;
    await mutate(`combo-${combo.id}`, `/catalog/combos/${combo.id}`, {
      method: "DELETE",
    });
  }

  function openItemEditor(item?: CatalogItem) {
    setEditor({ type: "item", item });
  }

  function openComboEditor(combo?: CatalogCombo) {
    setEditor({ type: "combo", combo });
  }

  const visibleItems = catalog.items.filter(
    (item) => kindFilter === "all" || item.kind === kindFilter,
  );
  const activeItemCount = catalog.items.filter(
    (item) => item.available && !item.deletedAt,
  ).length;
  const activeComboCount = catalog.combos.filter(
    (combo) => combo.available && !combo.deletedAt,
  ).length;

  return (
    <section
      id="catalogo"
      aria-labelledby="catalog-title"
      className="scroll-mt-8"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="catalog-title" className="text-xl font-black">
            Catálogo
          </h2>
          <p className="mt-1 text-sm text-[#77776e]">
            Gerencie itens, combos, preços e disponibilidade da loja.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          disabled={loading || Boolean(mutating)}
          aria-label="Atualizar catálogo"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d6d6ce] bg-white text-[#48483f] hover:border-[#8b1a2e] hover:text-[#8b1a2e] disabled:opacity-50"
        >
          <ArrowClockwiseIcon aria-hidden="true" size={17} />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#deded7] py-3">
        <div
          className="inline-flex rounded-md border border-[#deded7] bg-white p-1"
          aria-label="Tipo de catálogo"
        >
          {(
            [
              ["items", `Itens (${activeItemCount})`],
              ["combos", `Combos (${activeComboCount})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
              className={`min-h-9 rounded px-3 text-sm font-bold ${tab === value ? "bg-[#8b1a2e] text-white" : "text-[#55554e] hover:bg-[#f3f3ef]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tab === "items" && (
            <label>
              <span className="sr-only">Filtrar itens por tipo</span>
              <select
                value={kindFilter}
                onChange={(event) =>
                  setKindFilter(event.target.value as "all" | CatalogItemKind)
                }
                className="min-h-10 rounded-md border border-[#d6d6ce] bg-white px-3 text-sm"
              >
                <option value="all">Todos os tipos</option>
                {Object.entries(catalogKindLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={() =>
              tab === "items" ? openItemEditor() : openComboEditor()
            }
            disabled={loading || Boolean(mutating)}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#8b1a2e] px-4 text-sm font-extrabold text-white hover:bg-[#6b1222] disabled:opacity-50"
          >
            <PlusIcon aria-hidden="true" size={17} />
            {tab === "items" ? "Adicionar item" : "Criar combo"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-[#77776e]">
          Carregando catálogo...
        </p>
      ) : tab === "items" ? (
        visibleItems.length ? (
          <div className="mt-4 overflow-x-auto border border-[#deded7] bg-white">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-[#f3f3ef] text-xs uppercase text-[#68685f]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-extrabold">
                    Item
                  </th>
                  <th scope="col" className="px-4 py-3 font-extrabold">
                    Tipo
                  </th>
                  <th scope="col" className="px-4 py-3 font-extrabold">
                    Preço/adicional
                  </th>
                  <th scope="col" className="px-4 py-3 font-extrabold">
                    Disponibilidade
                  </th>
                  <th scope="col" className="px-4 py-3 font-extrabold">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e2]">
                {visibleItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fcfcfa]">
                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-[#68685f]">
                      {catalogKindLabels[item.kind]}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-bold">
                      {currency.format(item.priceCents / 100)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.deletedAt ? "bg-slate-100 text-slate-700" : item.available ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {item.deletedAt
                          ? "Arquivado"
                          : item.available
                            ? "Ativo"
                            : "Pausado"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!item.deletedAt && (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            disabled={Boolean(mutating)}
                            onClick={() => openItemEditor(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#8b1a2e] hover:underline disabled:opacity-50"
                          >
                            <PencilSimpleIcon aria-hidden="true" size={15} />{" "}
                            Editar
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(mutating)}
                            onClick={() => void toggleItem(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#55554e] hover:underline disabled:opacity-50"
                          >
                            {item.available ? (
                              <PauseIcon aria-hidden="true" size={15} />
                            ) : (
                              <PlayIcon aria-hidden="true" size={15} />
                            )}
                            {item.available ? "Pausar" : "Reativar"}
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(mutating)}
                            onClick={() => void archiveItem(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-800 hover:underline disabled:opacity-50"
                          >
                            <ArchiveBoxIcon aria-hidden="true" size={15} />{" "}
                            Excluir
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 border border-dashed border-[#d6d6ce] bg-white px-5 py-12 text-center text-sm text-[#77776e]">
            Nenhum item neste tipo.
          </p>
        )
      ) : catalog.combos.length ? (
        <div className="mt-4 overflow-x-auto border border-[#deded7] bg-white">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-[#f3f3ef] text-xs uppercase text-[#68685f]">
              <tr>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Combo
                </th>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Tamanho
                </th>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Preço
                </th>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Itens vinculados
                </th>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Disponibilidade
                </th>
                <th scope="col" className="px-4 py-3 font-extrabold">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e2]">
              {catalog.combos.map((combo) => (
                <tr key={combo.id} className="align-top hover:bg-[#fcfcfa]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{combo.name}</p>
                    {combo.tag && (
                      <p className="mt-1 text-xs text-[#77776e]">{combo.tag}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{combo.sizeName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs font-bold">
                    {currency.format(combo.priceCents / 100)}
                  </td>
                  <td className="max-w-sm px-4 py-3 text-xs text-[#55554e]">
                    {combo.items.length
                      ? combo.items
                          .map((item) => `${item.quantity}× ${item.name}`)
                          .join(", ")
                      : "Sem itens vinculados"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${combo.deletedAt ? "bg-slate-100 text-slate-700" : combo.available ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                    >
                      {combo.deletedAt
                        ? "Arquivado"
                        : combo.available
                          ? "Ativo"
                          : "Pausado"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!combo.deletedAt && (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          disabled={Boolean(mutating)}
                          onClick={() => openComboEditor(combo)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#8b1a2e] hover:underline disabled:opacity-50"
                        >
                          <PencilSimpleIcon aria-hidden="true" size={15} />{" "}
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(mutating)}
                          onClick={() => void toggleCombo(combo)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#55554e] hover:underline disabled:opacity-50"
                        >
                          {combo.available ? (
                            <PauseIcon aria-hidden="true" size={15} />
                          ) : (
                            <PlayIcon aria-hidden="true" size={15} />
                          )}
                          {combo.available ? "Pausar" : "Reativar"}
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(mutating)}
                          onClick={() => void archiveCombo(combo)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-800 hover:underline disabled:opacity-50"
                        >
                          <ArchiveBoxIcon aria-hidden="true" size={15} />{" "}
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 border border-dashed border-[#d6d6ce] bg-white px-5 py-12 text-center text-sm text-[#77776e]">
          Nenhum combo cadastrado.
        </p>
      )}

      {editor && (
        <CatalogEditorDialog
          key={
            editor.type === "item"
              ? `item-${editor.item?.id ?? "new"}`
              : `combo-${editor.combo?.id ?? "new"}`
          }
          editor={editor}
          items={catalog.items}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            setReloadKey((value) => value + 1);
          }}
        />
      )}
    </section>
  );
}
