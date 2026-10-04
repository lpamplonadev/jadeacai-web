import { TicketIcon } from "@phosphor-icons/react/dist/ssr";
import { ModuleEmptyState } from "@/features/admin/presentation/admin/modules/module-empty-state";

export function CouponsModule() {
  return (
    <section
      id="cupons"
      aria-labelledby="coupons-title"
      className="scroll-mt-8"
    >
      <div className="mb-4">
        <h2 id="coupons-title" className="text-xl font-black">
          Cupons
        </h2>
        <p className="mt-1 text-sm text-[#77776e]">
          Configure códigos promocionais, validade e regras de uso.
        </p>
      </div>
      <ModuleEmptyState
        icon={<TicketIcon aria-hidden="true" size={22} />}
        title="Cupons ainda não estão disponíveis"
        description="A API precisa validar promoções no servidor antes de habilitar a criação e o gerenciamento de cupons."
      />
    </section>
  );
}
