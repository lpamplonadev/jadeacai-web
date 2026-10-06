"use client";

import { XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { requestAdminApi } from "@/features/admin/infrastructure/admin-api";
import { catalogKindLabels } from "@/features/admin/presentation/admin/modules/catalog-editor-dialog";
import type {
  CatalogGourmet,
  CatalogItem,
  CatalogItemKind,
} from "@/features/admin/domain/catalog";

type GourmetEditorDialogProps = {
  gourmet?: CatalogGourmet;
  items: CatalogItem[];
  onClose: () => void;
  onSaved: () => void;
};

const inputClassName =
  "min-h-11 w-full rounded-md border border-[#d6d6ce] bg-white px-3 text-sm outline-none focus:border-[#8b1a2e]";
const defaultBanoffeDescription =
  "A cremosidade do açaí encontra a doçura do doce de leite e do leite condensado, com banana e um toque de canela. Uma combinação irresistível para transformar sua pausa em um momento especial.";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getBanoffeIngredients(items: CatalogItem[]) {
  const matches: Array<(name: string, kind: CatalogItemKind) => boolean> = [
    (name, kind) => kind === "flavor" && normalize(name) === "acai de banana",
    (name, kind) => kind === "fruit" && normalize(name) === "banana",
    (name) => normalize(name).includes("doce de leite"),
    (name) => normalize(name).includes("leite condensado"),
    (name) => normalize(name).includes("canela"),
  ];
  return Object.fromEntries(
    matches.flatMap((match) => {
      const item = items.find((candidate) => match(candidate.name, candidate.kind));
      return item ? [[item.id, 1] as const] : [];
    }),
  );
}

function toPriceInput(priceCents: number) {
  return (priceCents / 100).toFixed(2);
}

function toPriceCents(value: string) {
  const price = Number(value.replace(",", "."));
  return Number.isFinite(price) ? Math.round(price * 100) : -1;
}

export function GourmetEditorDialog({
  gourmet,
  items,
  onClose,
  onSaved,
}: GourmetEditorDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const linkedItemIDs = new Set(gourmet?.items.map((item) => item.itemId) ?? []);
  const linkedSizeIDs = new Set(gourmet?.sizes.map((size) => size.sizeItemId) ?? []);
  const selectableCatalogItems = items.filter(
    (item) => item.available && !item.deletedAt,
  );
  const editorItems = items.filter(
    (item) =>
      selectableCatalogItems.includes(item) ||
      linkedItemIDs.has(item.id) ||
      linkedSizeIDs.has(item.id),
  );
  const sizeItems = editorItems.filter((item) => item.kind === "size");
  const [name, setName] = useState(gourmet?.name ?? "Banoffe");
  const [description, setDescription] = useState(
    gourmet?.description ?? defaultBanoffeDescription,
  );
  const [tag, setTag] = useState(gourmet?.tag ?? "Receita da casa");
  const [imageUrl, setImageUrl] = useState(gourmet?.imageUrl ?? "");
  const [imageAlt, setImageAlt] = useState(gourmet?.imageAlt ?? "");
  const [available, setAvailable] = useState(gourmet?.available ?? true);
  const [sortOrder, setSortOrder] = useState(String(gourmet?.sortOrder ?? 0));
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    () =>
      gourmet
        ? Object.fromEntries(
            gourmet.items.map((item) => [item.itemId, item.quantity]),
          )
        : getBanoffeIngredients(editorItems),
  );
  const [sizePrices, setSizePrices] = useState<Record<string, string>>(() =>
    gourmet
      ? Object.fromEntries(
          gourmet.sizes.map((size) => [size.sizeItemId, toPriceInput(size.priceCents)]),
        )
      : Object.fromEntries(
          sizeItems
            .filter((size) => /(?:330|550|770)\s*ml/i.test(size.name))
            .map((size) => [size.id, ""]),
        ),
  );
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    setSelectedImageFile(file);
    setSelectedImageName(file.name);
    setUploadingImage(true);
    setError("");
    try {
      const response = await requestAdminApi("/catalog/images", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json().catch(() => null)) as {
        imageUrl?: string;
        error?: string;
      } | null;
      if (!response.ok || !result?.imageUrl) {
        throw new Error(result?.error ?? "Não foi possível enviar a imagem.");
      }
      setImageUrl(result.imageUrl);
      setSelectedImageFile(null);
      if (!imageAlt.trim()) {
        setImageAlt(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      }
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const sizeEntries = Object.entries(sizePrices);
    if (!description.trim()) {
      setError("Informe a descrição única deste Gourmet.");
      return;
    }
    if (!sizeEntries.length || sizeEntries.some(([, value]) => toPriceCents(value) < 0)) {
      setError("Selecione ao menos um tamanho e informe o preço de cada opção.");
      return;
    }
    if (
      !editorItems.some(
        (item) => item.kind === "flavor" && selectedItems[item.id] !== undefined,
      )
    ) {
      setError("Selecione um sabor de açaí para a receita.");
      return;
    }

    const endpoint = gourmet
      ? `/catalog/gourmets/${gourmet.id}`
      : "/catalog/gourmets";
    setSaving(true);
    try {
      const response = await requestAdminApi(endpoint, {
        method: gourmet ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          tag: tag.trim(),
          imageUrl: imageUrl.trim(),
          imageAlt: imageAlt.trim(),
          available,
          sortOrder: Number(sortOrder),
          items: Object.entries(selectedItems).map(([itemId, quantity]) => ({
            itemId,
            quantity,
          })),
          sizes: sizeEntries.map(([sizeItemId, price]) => ({
            sizeItemId,
            priceCents: toPriceCents(price),
          })),
        }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(result?.error ?? "Não foi possível salvar o Gourmet.");
      }
      onSaved();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o Gourmet.",
      );
    } finally {
      setSaving(false);
    }
  }

  function updateItem(itemId: string, quantity: number) {
    setSelectedItems((current) => {
      const next = { ...current };
      if (quantity > 0) next[itemId] = quantity;
      else delete next[itemId];
      return next;
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="gourmet-editor-title"
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
        <h2 id="gourmet-editor-title" className="text-xl font-black">
          {gourmet ? "Editar Gourmet" : "Criar Gourmet"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar formulário Gourmet"
          className="flex h-10 w-10 items-center justify-center rounded-md text-[#68685f] hover:bg-[#f3f3ef] hover:text-[#8b1a2e]"
        >
          <XIcon aria-hidden="true" size={19} />
        </button>
      </div>
      <form onSubmit={submit} className="space-y-5 px-5 py-6 sm:px-7">
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
        <label className="block space-y-1.5 text-sm font-bold">
          Descrição única para o cardápio
          <textarea
            required
            maxLength={1200}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`${inputClassName} py-3 leading-5`}
          />
        </label>
        <fieldset className="space-y-3">
          <legend className="text-sm font-black">Tamanhos e preços</legend>
          <p className="text-xs leading-5 text-[#77776e]">
            Marque os tamanhos disponíveis e defina um preço para cada opção.
          </p>
          <div className="divide-y divide-[#e8e8e2] border-y border-[#e8e8e2]">
            {sizeItems.map((size) => {
              const selected = Object.hasOwn(sizePrices, size.id);
              return (
                <div
                  key={size.id}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(120px,180px)] items-center gap-3 py-3"
                >
                  <label className="flex min-h-10 items-center gap-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={!selected && (!size.available || Boolean(size.deletedAt))}
                      onChange={(event) =>
                        setSizePrices((current) => {
                          const next = { ...current };
                          if (event.target.checked) next[size.id] = "";
                          else delete next[size.id];
                          return next;
                        })
                      }
                      className="h-4 w-4 accent-[#8b1a2e]"
                    />
                    <span>
                      {size.name}
                      {!size.available || size.deletedAt ? " (inativo)" : ""}
                    </span>
                  </label>
                  <label className="block space-y-1 text-xs font-bold">
                    <span className="sr-only">Preço de {size.name} (R$)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required={selected}
                      disabled={!selected}
                      value={sizePrices[size.id] ?? ""}
                      onChange={(event) =>
                        setSizePrices((current) => ({
                          ...current,
                          [size.id]: event.target.value,
                        }))
                      }
                      placeholder="Preço (R$)"
                      className={inputClassName}
                    />
                  </label>
                </div>
              );
            })}
          </div>
          {!sizeItems.length && (
            <p className="text-sm text-[#77776e]">
              Cadastre tamanhos na aba Itens antes de configurar o Gourmet.
            </p>
          )}
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="text-sm font-black">Receita fixa</legend>
          <p className="text-xs leading-5 text-[#77776e]">
            Selecione o sabor base e todos os ingredientes do produto pronto.
          </p>
          <div className="max-h-64 space-y-3 overflow-y-auto rounded-md border border-[#e2e2dc] bg-white p-3">
            {Object.entries(catalogKindLabels)
              .filter(([itemKind]) => itemKind !== "size")
              .map(([itemKind, label]) => {
                const group = editorItems.filter((item) => item.kind === itemKind);
                if (!group.length) return null;
                return (
                  <div key={itemKind}>
                    <h3 className="mb-1 text-xs font-extrabold uppercase text-[#77776e]">
                      {label}
                    </h3>
                    <ul className="divide-y divide-[#eeeeea]">
                      {group.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-2"
                        >
                          <label className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                            <input
                              type="checkbox"
                              checked={selectedItems[item.id] !== undefined}
                              disabled={
                                (!item.available || Boolean(item.deletedAt)) &&
                                selectedItems[item.id] === undefined
                              }
                              onChange={(event) =>
                                updateItem(item.id, event.target.checked ? 1 : 0)
                              }
                              className="h-4 w-4 shrink-0 accent-[#8b1a2e]"
                            />
                            <span className="truncate">
                              {item.name}
                              {!item.available || item.deletedAt ? " (inativo)" : ""}
                            </span>
                          </label>
                          {selectedItems[item.id] !== undefined && (
                            <input
                              aria-label={`Quantidade de ${item.name} na receita`}
                              type="number"
                              min="1"
                              max="100"
                              value={selectedItems[item.id]}
                              onChange={(event) =>
                                updateItem(item.id, Number(event.target.value))
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
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-bold">
            Selo
            <input
              maxLength={80}
              value={tag}
              onChange={(event) => setTag(event.target.value)}
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
        </div>
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
          Enviar imagem do dispositivo
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploadingImage || saving}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void uploadImage(file);
            }}
            className={`${inputClassName} file:mr-3 file:rounded file:border-0 file:bg-[#f8eeee] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#8b1a2e]`}
          />
        </label>
        {selectedImageFile && (
          <p role="status" className="text-sm font-semibold text-[#8b1a2e]">
            {uploadingImage
              ? `Enviando ${selectedImageName}...`
              : `Falha no envio de ${selectedImageName}.`}
          </p>
        )}
        <label className="block space-y-1.5 text-sm font-bold">
          Texto alternativo da imagem
          <input
            maxLength={180}
            value={imageAlt}
            onChange={(event) => setImageAlt(event.target.value)}
            className={inputClassName}
          />
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={available}
            onChange={(event) => setAvailable(event.target.checked)}
            className="h-4 w-4 accent-[#8b1a2e]"
          />
          Disponível na loja
        </label>
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
            disabled={saving || uploadingImage || selectedImageFile !== null}
            className="min-h-11 rounded-md bg-[#8b1a2e] px-5 text-sm font-extrabold text-white hover:bg-[#6b1222] disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar Gourmet"}
          </button>
        </div>
      </form>
    </dialog>
  );
}