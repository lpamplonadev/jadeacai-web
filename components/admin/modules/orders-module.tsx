import { ClipboardTextIcon } from "@phosphor-icons/react/dist/ssr";
import { ModuleEmptyState } from "@/components/admin/modules/module-empty-state";

export function OrdersModule() {
  return (
    <section
      id="pedidos"
      aria-labelledby="orders-title"
      className="scroll-mt-8"
    >
      <div className="mb-4">
        <h2 id="orders-title" className="text-xl font-black">
          Pedidos
        </h2>
        <p className="mt-1 text-sm text-[#77776e]">
          Consulte pedidos recebidos e acompanhe cada etapa da operação.
        </p>
      </div>
      <ModuleEmptyState
        icon={<ClipboardTextIcon aria-hidden="true" size={22} />}
        title="A listagem ainda não está conectada"
        description="A API precisa oferecer uma rota protegida para consultar os pedidos salvos e alterar seus status."
      />
    </section>
  );
}
