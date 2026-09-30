"use client";

import { XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

export type CatalogItemKind =
  | "flavor"
  | "size"
  | "topping"
  | "sauce"
  | "condiment_position"
  | "fruit"
  | "extra";

export type CatalogItem = {
  id: string;
  itemKey: string;
  kind: CatalogItemKind;
  name: string;
  priceCents: number;
  available: boolean;
  sortOrder: number;
  deletedAt: string | null;
};

export type CatalogComboItem = {
  itemId: string;
  itemKey: string;
  kind: CatalogItemKind;
  name: string;
  quantity: number;
  available: boolean;
};

export type CatalogCombo = {
  id: string;
  comboKey: string;
  name: string;
  sizeItemId: string;
  sizeName: string;
  priceCents: number;
  includedToppings: number;
  includedFruits: number;
  includedExtras: number;
  tag: string;
  imageUrl: string;
  imageAlt: string;
  available: boolean;
  sortOrder: number;
  deletedAt: string | null;
  items: CatalogComboItem[];
};

export type CatalogEditor =
  | { type: "item"; item?: CatalogItem }
  | { type: "combo"; combo?: CatalogCombo };

type CatalogEditorDialogProps = {
  editor: CatalogEditor;
  items: CatalogItem[];
  onClose: () => void;
  onSaved: () => void;
};

export const catalogKindLabels: Record<CatalogItemKind, string> = {
  flavor: "Sabor",
  size: "Tamanho",
  topping: "Acompanhamento",
  sauce: "Calda",
  condiment_position: "Posição dos condimentos",
  fruit: "Fruta",
  extra: "Extra",
};

const inputClassName =
  "min-h-11 w-full rounded-md border border-[#d6d6ce] bg-white px-3 text-sm outline-none focus:border-[#8b1a2e]";

function toPriceInput(priceCents: number) {
  return (priceCents / 100).toFixed(2);
}

function toPriceCents(value: string) {
  const price = Number(value.replace(",", "."));
  return Number.isFinite(price) ? Math.round(price * 100) : -1;
}

export function CatalogEditorDialog({
  editor,
  items,
  onClose,
  onSaved,
}: CatalogEditorDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const item = editor.type === "item" ? editor.item : undefined;
  const combo = editor.type === "combo" ? editor.combo : undefined;
  const linkedItemIDs = new Set(
    (combo?.items ?? []).map((comboItem) => comboItem.itemId),
  );
  const activeItems = items.filter(
    (catalogItem) =>
      (catalogItem.available && !catalogItem.deletedAt) ||
      linkedItemIDs.has(catalogItem.id) ||
      catalogItem.id === combo?.sizeItemId,
  );
  const sizeItems = activeItems.filter(
    (catalogItem) => catalogItem.kind === "size",
  );
  const selectableItems = activeItems.filter(
    (catalogItem) => catalogItem.kind !== "size",
  );
  const [kind, setKind] = useState<CatalogItemKind>(item?.kind ?? "topping");
  const [name, setName] = useState(item?.name ?? combo?.name ?? "");
  const [price, setPrice] = useState(
    toPriceInput(item?.priceCents ?? combo?.priceCents ?? 0),
  );
  const [available, setAvailable] = useState(
    item?.available ?? combo?.available ?? true,
  );
  const [sortOrder, setSortOrder] = useState(
    String(item?.sortOrder ?? combo?.sortOrder ?? 0),
  );
  const [sizeItemId, setSizeItemId] = useState(combo?.sizeItemId ?? "");
  const [includedToppings, setIncludedToppings] = useState(
    String(combo?.includedToppings ?? 0),
  );
  const [includedFruits, setIncludedFruits] = useState(
    String(combo?.includedFruits ?? 0),
  );
  const [includedExtras, setIncludedExtras] = useState(
    String(combo?.includedExtras ?? 0),
  );
  const [tag, setTag] = useState(combo?.tag ?? "");
  const [imageUrl, setImageUrl] = useState(combo?.imageUrl ?? "");
  const [imageAlt, setImageAlt] = useState(combo?.imageAlt ?? "");
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    Object.fromEntries(
      (combo?.items ?? []).map((comboItem) => [
        comboItem.itemId,
        comboItem.quantity,
      ]),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const endpoint =
      editor.type === "item"
        ? item
          ? `/admin/api/catalog/items/${item.id}`
          : "/admin/api/catalog/items"
        : combo
          ? `/admin/api/catalog/combos/${combo.id}`
          : "/admin/api/catalog/combos";
    const method =
      editor.type === "item"
        ? item
          ? "PATCH"
          : "POST"
        : combo
          ? "PATCH"
          : "POST";
    const priceCents = toPriceCents(price);

    const body =
      editor.type === "item"
        ? {
            kind,
            name: name.trim(),
            priceCents,
            available,
            sortOrder: Number(sortOrder),
          }
        : {
            name: name.trim(),
            sizeItemId,
            priceCents,
            includedToppings: Number(includedToppings),
            includedFruits: Number(includedFruits),
            includedExtras: Number(includedExtras),
            tag,
            imageUrl,
            imageAlt,
            available,
            sortOrder: Number(sortOrder),
            items: Object.entries(selectedItems).map(([itemId, quantity]) => ({
              itemId,
              quantity,
            })),
          };

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(result?.error ?? "Não foi possível salvar o catálogo.");
      }
      onSaved();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o catálogo.",
      );
    } finally {
      setSaving(false);
    }
  }

  function updateSelectedItem(itemId: string, quantity: number) {
    setSelectedItems((current) => {
      const next = { ...current };
      if (quantity > 0) next[itemId] = quantity;
      else delete next[itemId];
      return next;
    });
  }

  const title =
    editor.type === "item"
      ? item
        ? "Editar item"
        : "Adicionar item"
      : combo
        ? "Editar combo"
        : "Criar combo";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="catalog-editor-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(760px,calc(100%-2rem))] overflow-y-auto rounded-lg border border-[#deded7] bg-[#fffdfb] p-0 text-[#292923] shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[#deded7] px-5 py-4 sm:px-7">
        <h2 id="catalog-editor-title" className="text-xl font-black">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar formulário"
          className="flex h-10 w-10 items-center justify-center rounded-md text-[#68685f] hover:bg-[#f3f3ef] hover:text-[#8b1a2e]"
        >
          <XIcon aria-hidden="true" size={19} />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-5 px-5 py-6 sm:px-7">
        {editor.type === "item" ? (
          <>
            {!item ? (
              <label className="block space-y-1.5 text-sm font-bold">
                Tipo
                <select
                  value={kind}
                  onChange={(event) =>
                    setKind(event.target.value as CatalogItemKind)
                  }
                  className={inputClassName}
                >
                  {Object.entries(catalogKindLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="text-xs font-bold uppercase text-[#8b1a2e]">
                {catalogKindLabels[item.kind]}
              </p>
            )}
            <label className="block space-y-1.5 text-sm font-bold">
              Nome
              <input
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClassName}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 text-sm font-bold">
                Preço ou adicional (R$)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-1.5 text-sm font-bold">
                Ordem no catálogo
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={available}
                onChange={(event) => setAvailable(event.target.checked)}
                className="h-4 w-4 accent-[#8b1a2e]"
              />
              Disponível na loja
            </label>
          </>
        ) : (
          <>
            <label className="block space-y-1.5 text-sm font-bold">
              Nome do combo
              <input
                required
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClassName}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 text-sm font-bold">
                Tamanho
                <select
                  required
                  value={sizeItemId}
                  onChange={(event) => setSizeItemId(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Selecione um tamanho</option>
                  {sizeItems.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}{!size.available || size.deletedAt ? " (inativo)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5 text-sm font-bold">
                Preço (R$)
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block space-y-1.5 text-sm font-bold">
                Acompanhamentos incluídos
                <input
                  type="number"
                  min="0"
                  value={includedToppings}
                  onChange={(event) => setIncludedToppings(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-1.5 text-sm font-bold">
                Frutas incluídas
                <input
                  type="number"
                  min="0"
                  value={includedFruits}
                  onChange={(event) => setIncludedFruits(event.target.value)}
                  className={inputClassName}
                />
              </label>
              <label className="block space-y-1.5 text-sm font-bold">
                Extras incluídos
                <input
                  type="number"
                  min="0"
                  value={includedExtras}
                  onChange={(event) => setIncludedExtras(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </div>
            <label className="block space-y-1.5 text-sm font-bold">
              Destaque
              <input
                maxLength={80}
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="block space-y-1.5 text-sm font-bold">
              URL da imagem
              <input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="block space-y-1.5 text-sm font-bold">
              Texto alternativo da imagem
              <input
                maxLength={180}
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="block space-y-1.5 text-sm font-bold">
              Ordem no catálogo
              <input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className={inputClassName}
              />
            </label>
            <fieldset className="space-y-3">
              <legend className="text-sm font-black">
                Itens selecionados para o combo
              </legend>
              {!selectableItems.length && (
                <p className="text-sm text-[#77776e]">
                  Cadastre itens ativos antes de montar um combo.
                </p>
              )}
              <div className="max-h-64 space-y-3 overflow-y-auto rounded-md border border-[#e2e2dc] bg-white p-3">
                {Object.entries(catalogKindLabels)
                  .filter(([itemKind]) => itemKind !== "size")
                  .map(([itemKind, label]) => {
                    const group = selectableItems.filter(
                      (catalogItem) => catalogItem.kind === itemKind,
                    );
                    if (!group.length) return null;
                    return (
                      <div key={itemKind}>
                        <h3 className="mb-1 text-xs font-extrabold uppercase text-[#77776e]">
                          {label}
                        </h3>
                        <ul className="divide-y divide-[#eeeeea]">
                          {group.map((catalogItem) => (
                            <li
                              key={catalogItem.id}
                              className="flex items-center justify-between gap-3 py-2"
                            >
                              <label className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedItems[catalogItem.id] !== undefined
                                  }
                                  disabled={
                                    (!catalogItem.available || Boolean(catalogItem.deletedAt)) &&
                                    selectedItems[catalogItem.id] === undefined
                                  }
                                  onChange={(event) =>
                                    updateSelectedItem(
                                      catalogItem.id,
                                      event.target.checked ? 1 : 0,
                                    )
                                  }
                                  className="h-4 w-4 shrink-0 accent-[#8b1a2e]"
                                />
                                <span className="truncate">
                                  {catalogItem.name}{!catalogItem.available || catalogItem.deletedAt ? " (inativo)" : ""}
                                </span>
                              </label>
                              {selectedItems[catalogItem.id] !== undefined && (
                                <input
                                  aria-label={`Quantidade de ${catalogItem.name} no combo`}
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={selectedItems[catalogItem.id]}
                                  onChange={(event) =>
                                    updateSelectedItem(
                                      catalogItem.id,
                                      Number(event.target.value),
                                    )
                                  }
                                  className="min-h-9 w-20 rounded-md border border-[#d6d6ce] px-2 text-sm"
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
              </div>
            </fieldset>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={available}
                onChange={(event) => setAvailable(event.target.checked)}
                className="h-4 w-4 accent-[#8b1a2e]"
              />
              Disponível na loja
            </label>
          </>
        )}

        {error && (
          <p role="alert" className="text-sm font-semibold text-red-800">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#e8e8e2] pt-4 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-md border border-[#d6d6ce] px-4 text-sm font-bold text-[#55554e]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-md bg-[#8b1a2e] px-5 text-sm font-extrabold text-white hover:bg-[#6b1222] disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
