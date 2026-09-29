import { PackageIcon } from "@phosphor-icons/react/dist/ssr";
import { ModuleEmptyState } from "@/components/admin/modules/module-empty-state";

export function CatalogModule() {
  return (
    <section
      id="catalogo"
      aria-labelledby="catalog-title"
      className="scroll-mt-8"
    >
      <div className="mb-4">
        <h2 id="catalog-title" className="text-xl font-black">
          Catálogo
        </h2>
        <p className="mt-1 text-sm text-[#77776e]">
          Gerencie itens, combos, preços e disponibilidade da loja.
        </p>
      </div>
      <ModuleEmptyState
        icon={<PackageIcon aria-hidden="true" size={22} />}
        title="O catálogo ainda não pode ser editado"
        description="A API precisa oferecer rotas administrativas para consultar e alterar itens e preços."
      />
    </section>
  );
}
