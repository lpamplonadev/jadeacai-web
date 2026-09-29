import type { MenuCombo } from "@/components/menu/menu-data";

type ComboLimitDialogProps = {
  combo: MenuCombo;
  pendingGroupName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ComboLimitDialog({
  combo,
  pendingGroupName,
  onCancel,
  onConfirm,
}: ComboLimitDialogProps) {
  const includedItems = [
    `${combo.includedToppings} adicionais`,
    ...(combo.includedFruits > 0
      ? [
          `${combo.includedFruits} ${combo.includedFruits === 1 ? "fruta" : "frutas"}`,
        ]
      : []),
    `${combo.includedExtras} ${combo.includedExtras === 1 ? "extra" : "extras"}`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/70 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="combo-upgrade-title"
        className="w-full max-w-md rounded-md bg-cream p-6 text-text shadow-2xl"
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-coral">
          Limite do combo atingido
        </p>
        <h3
          id="combo-upgrade-title"
          className="mt-2 text-2xl font-black text-crimson"
        >
          Continuar como açaí livre?
        </h3>
        <p className="mt-3 text-sm leading-6 text-crimson/80">
          O {combo.name} inclui {includedItems.join(", ")}. Ao adicionar{" "}
          {pendingGroupName}, você sai do preço fechado do combo e o total será
          recalculado.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 rounded-md border border-blush px-4 text-sm font-bold text-crimson transition-colors hover:bg-petal"
          >
            Manter meu combo
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-11 rounded-md bg-crimson px-4 text-sm font-bold text-white transition-colors hover:bg-dark"
          >
            Sair do combo e continuar livre
          </button>
        </div>
      </section>
    </div>
  );
}
