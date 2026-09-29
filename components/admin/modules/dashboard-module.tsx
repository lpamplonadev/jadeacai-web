import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { ModuleEmptyState } from "@/components/admin/modules/module-empty-state";

const metrics = [
  "Pedidos hoje",
  "Aguardando preparo",
  "Em produção",
  "Concluídos hoje",
];

const statuses = [
  "Recebido",
  "Preparando",
  "Pronto",
  "Saiu para entrega",
  "Entregue",
  "Finalizado",
];

export function DashboardModule() {
  return (
    <section
      id="dashboard"
      aria-labelledby="dashboard-title"
      className="scroll-mt-8"
    >
      <div className="mb-6 flex items-start gap-3 border-l-[3px] border-[#c78226] bg-[#fff8eb] px-4 py-3.5 text-sm leading-6 text-[#624717]">
        <ArrowUpRightIcon
          aria-hidden="true"
          className="mt-1 shrink-0"
          size={17}
        />
        <p>
          Login protegido e ativo. A API ainda precisa disponibilizar rotas
          administrativas autenticadas; nenhum dado operacional é inventado.
        </p>
      </div>

      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 id="dashboard-title" className="text-base font-extrabold">
          Hoje
        </h2>
        <span className="text-xs font-medium text-[#77776e]">
          Aguardando integração da API
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((label, index) => (
          <article key={label} className="border border-[#e2e2dc] bg-white p-4">
            <p className="text-xs font-bold text-[#73736a]">{label}</p>
            <p
              className={`mt-3 text-3xl font-black ${index === 1 ? "text-[#a34b29]" : "text-[#292923]"}`}
            >
              —
            </p>
            <p className="mt-2 text-[11px] leading-4 text-[#898980]">
              Sem dados administrativos disponíveis
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="border border-[#e2e2dc] bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-[#e8e8e2] px-4 py-4 sm:px-5">
            <div>
              <h3 className="font-extrabold">Pedidos recentes</h3>
              <p className="mt-1 text-xs text-[#77776e]">
                Aguardando rota autenticada de listagem
              </p>
            </div>
            <span className="rounded-sm bg-[#f0f0eb] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#77776e]">
              Sem dados
            </span>
          </div>
          <ModuleEmptyState
            icon={<span className="text-lg font-black">0</span>}
            title="Aguardando conexão com os pedidos"
            description="A API precisa oferecer uma rota protegida para consultar pedidos salvos e atualizar seus status."
          />
        </section>

        <section className="border border-[#e2e2dc] bg-white">
          <div className="border-b border-[#e8e8e2] px-4 py-4">
            <h3 className="font-extrabold">Fluxo dos pedidos</h3>
            <p className="mt-1 text-xs text-[#77776e]">
              Contagens virão da API
            </p>
          </div>
          <ol className="divide-y divide-[#eeeeea] px-4">
            {statuses.map((status, index) => (
              <li
                key={status}
                className="flex min-h-11 items-center justify-between gap-3 text-sm"
              >
                <span className="flex items-center gap-2.5 font-semibold text-[#55554e]">
                  <span
                    className={`h-2 w-2 rounded-full ${index === 0 ? "bg-[#c78226]" : index === 1 ? "bg-[#8b1a2e]" : "bg-[#b8b8af]"}`}
                  />
                  {status}
                </span>
                <span className="text-xs font-bold text-[#929289]">—</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  );
}
