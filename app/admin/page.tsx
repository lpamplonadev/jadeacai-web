import { ArrowUpRightIcon, SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { connection } from "next/server";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { logoutAction } from "@/app/admin/actions";
import { hasValidAdminSession, isAdminAuthConfigured } from "@/lib/admin-auth";

const dashboardMetrics = [
  {
    label: "Pedidos hoje",
    value: "—",
    detail: "Aguardando conexão administrativa",
  },
  {
    label: "Aguardando preparo",
    value: "—",
    detail: "Aguardando conexão administrativa",
  },
  {
    label: "Em produção",
    value: "—",
    detail: "Aguardando conexão administrativa",
  },
  {
    label: "Concluídos hoje",
    value: "—",
    detail: "Aguardando conexão administrativa",
  },
];

const orderStatuses = [
  "Recebido",
  "Preparando",
  "Pronto",
  "Saiu para entrega",
  "Entregue",
  "Finalizado",
];

export default async function AdminPage() {
  await connection();
  const authenticated = await hasValidAdminSession();

  if (!authenticated) {
    const configured = isAdminAuthConfigured();

    return (
      <main className="grid min-h-screen bg-[#f3f3ef] text-[#292923] md:grid-cols-[minmax(280px,0.85fr)_1.15fr]">
        <section className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[#731a2a] px-7 py-8 text-white md:min-h-screen md:px-12 md:py-12">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-36 -left-24 h-96 w-96 rounded-full border border-white/10" />
          <Link
            href="/"
            className="relative sm:text-2xl text-center text-lg font-extrabold tracking-wide"
            style={{ fontFamily: "Pacifico, cursive" }}
          >
            Jade Açaí
          </Link>
          <div className="relative my-10 max-w-md md:my-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#f2a4a7]">
              Área restrita
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              A loja, em um só lugar.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/75">
              Acompanhe a operação e mantenha o dia de pedidos sob controle.
            </p>
          </div>
          <p className="relative text-xs text-white/55">
            Jade Açaí · Painel de operação
          </p>
        </section>

        <section className="flex items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b1a2e]">
              Administração
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Entrar no painel
            </h2>
            <p className="mt-2 mb-8 text-sm leading-6 text-[#68685f]">
              Use as credenciais administrativas para continuar.
            </p>
            <AdminLoginForm configured={configured} />
            <Link
              href="/"
              className="mt-7 inline-flex text-sm font-semibold text-[#68685f] underline decoration-[#c8c8bf] underline-offset-4 hover:text-[#8b1a2e]"
            >
              Voltar à loja
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f3ef] text-[#292923]">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-60 shrink-0 border-r border-[#e3e3dc] bg-white px-5 py-7 md:flex md:flex-col">
          <Link
            href="/"
            className="text-sm font-black tracking-wide text-[#731a2a]"
          >
            JADE <span className="font-semibold text-[#8b8b80]">AÇAÍ</span>
          </Link>
          <p className="mt-10 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#929289]">
            Operação
          </p>
          <nav aria-label="Navegação administrativa" className="mt-3 space-y-1">
            <Link
              href="/admin"
              aria-current="page"
              className="flex min-h-10 items-center rounded-md border-l-2 border-[#8b1a2e] bg-[#f8eeee] px-3 text-sm font-bold text-[#731a2a]"
            >
              Visão geral
            </Link>
            {["Pedidos", "Catálogo", "Cupons"].map((item) => (
              <span
                key={item}
                aria-disabled="true"
                className="flex min-h-10 cursor-not-allowed items-center justify-between rounded-md px-3 text-sm font-semibold text-[#96968d]"
                title="Disponível quando as rotas administrativas da API forem implementadas"
              >
                {item}
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  Em breve
                </span>
              </span>
            ))}
          </nav>
          <div className="mt-auto border-t border-[#e8e8e2] pt-4">
            <p className="px-3 text-xs font-semibold text-[#77776e]">
              Sessão protegida
            </p>
            <form action={logoutAction}>
              <button className="mt-2 flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-sm font-bold text-[#731a2a] hover:bg-[#f8eeee]">
                <SignOutIcon aria-hidden="true" size={17} />
                Sair do painel
              </button>
            </form>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-8 lg:px-11">
          <header className="flex items-start justify-between gap-4 border-b border-[#deded7] pb-6">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b1a2e]">
                Jade Açaí · Administração
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Visão geral
              </h1>
            </div>
            <form action={logoutAction} className="md:hidden">
              <button
                aria-label="Sair do painel"
                title="Sair do painel"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-[#deded7] bg-white text-[#731a2a]"
              >
                <SignOutIcon aria-hidden="true" size={18} />
              </button>
            </form>
          </header>

          <div className="mt-6 flex items-start gap-3 border-l-[3px] border-[#c78226] bg-[#fff8eb] px-4 py-3.5 text-sm leading-6 text-[#624717]">
            <ArrowUpRightIcon
              aria-hidden="true"
              className="mt-1 shrink-0"
              size={17}
            />
            <p>
              Login protegido e ativo. Para carregar pedidos e métricas reais, a
              API precisa disponibilizar rotas administrativas autenticadas; por
              enquanto, nenhum dado operacional é exibido.
            </p>
          </div>

          <section aria-label="Indicadores do dia" className="mt-7">
            <div className="mb-3 flex items-end justify-between gap-3">
              <h2 className="text-base font-extrabold">Hoje</h2>
              <span className="text-xs font-medium text-[#77776e]">
                Indicadores indisponíveis até a integração da API
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {dashboardMetrics.map((metric, index) => (
                <article
                  key={metric.label}
                  className="border border-[#e2e2dc] bg-white p-4"
                >
                  <p className="text-xs font-bold text-[#73736a]">
                    {metric.label}
                  </p>
                  <p
                    className={`mt-3 text-3xl font-black ${index === 1 ? "text-[#a34b29]" : "text-[#292923]"}`}
                  >
                    {metric.value}
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-[#898980]">
                    {metric.detail}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="border border-[#e2e2dc] bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[#e8e8e2] px-4 py-4 sm:px-5">
                <div>
                  <h2 className="font-extrabold">Pedidos recentes</h2>
                  <p className="mt-1 text-xs text-[#77776e]">
                    Atualização disponível após criar a rota de listagem
                  </p>
                </div>
                <span className="rounded-sm bg-[#f0f0eb] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#77776e]">
                  Sem dados
                </span>
              </div>
              <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8eeee] text-[#8b1a2e]">
                  <span className="text-lg font-black">0</span>
                </span>
                <h3 className="mt-4 text-sm font-extrabold">
                  Aguardando conexão com os pedidos
                </h3>
                <p className="mt-2 max-w-md text-xs leading-5 text-[#77776e]">
                  O backend precisa oferecer uma rota protegida para consultar
                  pedidos salvos e atualizar seus status.
                </p>
              </div>
            </section>

            <section className="border border-[#e2e2dc] bg-white">
              <div className="border-b border-[#e8e8e2] px-4 py-4">
                <h2 className="font-extrabold">Fluxo dos pedidos</h2>
                <p className="mt-1 text-xs text-[#77776e]">
                  Contagens vindas da API
                </p>
              </div>
              <ol className="divide-y divide-[#eeeeea] px-4">
                {orderStatuses.map((status, index) => (
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
      </div>
    </main>
  );
}
