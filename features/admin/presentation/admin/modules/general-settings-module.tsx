"use client";

import { useEffect, useState, type FormEvent } from "react";
import { requestAdminApi } from "@/features/admin/infrastructure/admin-api";
import {
  defaultStoreSettings,
  storeWeekdays,
  type OperatingHours,
  type StoreSettings,
  type StoreStatus,
  type StoreWeekday,
} from "@/shared/domain/store-settings";

const textInputClassName =
  "min-h-11 w-full rounded-md border border-[#d6d6ce] bg-white px-3 text-sm text-[#33332d] outline-none focus:border-[#8b1a2e]";

async function readError(response: Response) {
  const result = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return result?.error ?? `A API respondeu com erro (${response.status}).`;
}

export function GeneralSettingsModule() {
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      setLoading(true);
      try {
        const response = await requestAdminApi("/settings", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(await readError(response));
        const result = (await response.json()) as StoreStatus;
        setStoreStatus(result);
        setSettings(result.settings);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar as configurações.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadSettings();
    return () => controller.abort();
  }, []);

  function updateHours(
    day: StoreWeekday,
    field: keyof OperatingHours,
    value: string | boolean,
  ) {
    setSettings((current) => ({
      ...current,
      weeklyHours: {
        ...current.weeklyHours,
        [day]: { ...current.weeklyHours[day], [field]: value },
      },
    }));
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const response = await requestAdminApi("/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error(await readError(response));
      const result = (await response.json()) as StoreStatus;
      setStoreStatus(result);
      setSettings(result.settings);
      setFeedback("Configurações salvas.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar as configurações.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function setManualOverride(manualOverride: boolean | null) {
    setSavingOverride(true);
    setError("");
    setFeedback("");
    try {
      const response = await requestAdminApi("/settings/override", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manualOverride }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const result = (await response.json()) as StoreStatus;
      setStoreStatus(result);
      setSettings(result.settings);
      setFeedback(
        manualOverride === null
          ? "Funcionamento automático ativado."
          : manualOverride
            ? "Loja aberta manualmente."
            : "Loja fechada manualmente.",
      );
    } catch (overrideError) {
      setError(
        overrideError instanceof Error
          ? overrideError.message
          : "Não foi possível atualizar o estado da loja.",
      );
    } finally {
      setSavingOverride(false);
    }
  }

  return (
    <section
      id="configuracoes"
      aria-labelledby="settings-title"
      className="scroll-mt-8"
    >
      <div className="mb-5 border-b border-[#deded7] pb-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b1a2e]">
          Operação
        </p>
        <h2 id="settings-title" className="mt-1 text-2xl font-black">
          Configurações gerais
        </h2>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm font-semibold text-[#a5233a]">
          {error}
        </p>
      )}
      {feedback && (
        <p role="status" className="mb-4 text-sm font-semibold text-green-800">
          {feedback}
        </p>
      )}

      <div className="flex flex-col gap-4 border-y border-[#deded7] py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`size-3 rounded-full ${storeStatus?.isOpen ? "bg-[#25D366] shadow-[0_0_14px_rgba(37,211,102,0.8)]" : "bg-neutral-400"}`}
          />
          <p className="text-sm font-bold">
            {loading
              ? "Consultando estado da loja..."
              : storeStatus?.isOpen
                ? "Loja aberta"
                : "Loja fechada"}
            {storeStatus?.manualOverride !== null && storeStatus?.manualOverride !== undefined
              ? " · controle manual"
              : " · horário programado"}
          </p>
        </div>
        <div
          role="group"
          aria-label="Controle manual da loja"
          className="flex flex-wrap gap-2"
        >
          {(
            [
              { value: null, label: "Automático" },
              { value: true, label: "Abrir loja" },
              { value: false, label: "Fechar loja" },
            ] as const
          ).map((option) => (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={storeStatus?.manualOverride === option.value}
              disabled={loading || savingOverride}
              onClick={() => void setManualOverride(option.value)}
              className={`min-h-10 rounded-md border px-3 text-sm font-bold transition-colors disabled:cursor-wait disabled:opacity-50 ${
                storeStatus?.manualOverride === option.value
                  ? "border-[#8b1a2e] bg-[#8b1a2e] text-white"
                  : "border-[#d6d6ce] bg-white text-[#48483f] hover:border-[#8b1a2e]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p role="status" className="py-8 text-sm text-[#77776e]">
          Carregando configurações...
        </p>
      ) : (
        <form onSubmit={saveSettings} className="divide-y divide-[#deded7]">
          <fieldset className="py-6">
            <legend className="text-lg font-extrabold">Horário de funcionamento</legend>
            <p className="mt-1 text-sm text-[#77776e]">
              Fuso horário: {storeStatus?.timeZone ?? "America/Sao_Paulo"}. A loja fecha fora dos períodos definidos.
            </p>
            <div className="mt-4 divide-y divide-[#ecece6]">
              {storeWeekdays.map(({ key, label }) => {
                const hours = settings.weeklyHours[key];
                return (
                  <div
                    key={key}
                    className="grid gap-3 py-3 sm:grid-cols-[minmax(170px,1fr)_minmax(120px,180px)_minmax(120px,180px)] sm:items-center"
                  >
                    <label className="flex min-h-10 items-center gap-3 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={hours.enabled}
                        onChange={(event) =>
                          updateHours(key, "enabled", event.target.checked)
                        }
                        className="size-4 accent-[#8b1a2e]"
                      />
                      {label}
                    </label>
                    <label className="space-y-1 text-xs font-semibold text-[#77776e]">
                      Abre
                      <input
                        type="time"
                        required={hours.enabled}
                        disabled={!hours.enabled}
                        value={hours.opensAt}
                        onChange={(event) =>
                          updateHours(key, "opensAt", event.target.value)
                        }
                        className="min-h-10 w-full rounded-md border border-[#d6d6ce] bg-white px-3 text-sm text-[#33332d] disabled:bg-[#f3f3ef]"
                      />
                    </label>
                    <label className="space-y-1 text-xs font-semibold text-[#77776e]">
                      Fecha
                      <input
                        type="time"
                        required={hours.enabled}
                        disabled={!hours.enabled}
                        value={hours.closesAt}
                        onChange={(event) =>
                          updateHours(key, "closesAt", event.target.value)
                        }
                        className="min-h-10 w-full rounded-md border border-[#d6d6ce] bg-white px-3 text-sm text-[#33332d] disabled:bg-[#f3f3ef]"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="grid gap-5 py-6 lg:grid-cols-2">
            <legend className="text-lg font-extrabold lg:col-span-2">
              Informações da loja
            </legend>
            <label className="space-y-1.5 text-sm font-semibold">
              WhatsApp da loja
              <input
                type="tel"
                inputMode="tel"
                required
                value={settings.whatsAppNumber}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    whatsAppNumber: event.target.value,
                  }))
                }
                placeholder="55 (21) 99017-4473"
                className={textInputClassName}
              />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">
              Título da seção Nossa história
              <input
                required
                maxLength={120}
                value={settings.story.title}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    story: { ...current.story, title: event.target.value },
                  }))
                }
                className={textInputClassName}
              />
            </label>
            <label className="space-y-1.5 text-sm font-semibold lg:col-span-2">
              Texto da seção Nossa história
              <textarea
                required
                maxLength={2000}
                rows={4}
                value={settings.story.body}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    story: { ...current.story, body: event.target.value },
                  }))
                }
                className={`${textInputClassName} resize-y py-3`}
              />
              <span className="block text-right text-xs font-normal text-[#77776e]">
                {settings.story.body.length}/2000
              </span>
            </label>
          </fieldset>

          <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#77776e]">
              As alterações de horário afetam imediatamente a abertura da loja e os novos pedidos.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-md bg-[#8b1a2e] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#6b1222] disabled:cursor-wait disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar configurações"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}