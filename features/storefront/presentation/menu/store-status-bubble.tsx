import type { StoreStatus } from "@/shared/domain/store-settings";

export function StoreStatusBubble({ status }: { status: StoreStatus | null }) {
  const isOpen = status?.isOpen ?? false;
  const label = status
    ? isOpen
      ? "Loja aberta"
      : "Loja fechada"
    : "Verificando funcionamento";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-[calc(env(safe-area-inset-bottom)+92px)] right-4 z-40 inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 text-xs font-extrabold text-white shadow-lg md:bottom-6 ${
        isOpen
          ? "border-[#25D366]/60 bg-[#128C7E] shadow-[0_0_22px_rgba(37,211,102,0.45)]"
          : "border-neutral-300 bg-neutral-500 shadow-neutral-950/10"
      }`}
    >
      <span className="relative flex size-2.5" aria-hidden="true">
        {isOpen && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#b9ffd4] opacity-80" />
        )}
        <span
          className={`relative inline-flex size-2.5 rounded-full ${
            isOpen ? "bg-[#d4ffe3]" : "bg-neutral-300"
          }`}
        />
      </span>
      {label}
    </div>
  );
}
