import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { AdminLoginForm } from "@/features/admin/presentation/admin/admin-login-form";
import { DesktopAdminNavigation } from "@/features/admin/presentation/admin/desktop-admin-navigation";
import { MobileAdminMenu } from "@/features/admin/presentation/admin/mobile-admin-menu";
import { CatalogModule } from "@/features/admin/presentation/admin/modules/catalog-module";
import { CouponsModule } from "@/features/admin/presentation/admin/modules/coupons-module";
import { DashboardModule } from "@/features/admin/presentation/admin/modules/dashboard-module";
import { GeneralSettingsModule } from "@/features/admin/presentation/admin/modules/general-settings-module";
import { OrdersModule } from "@/features/admin/presentation/admin/modules/orders-module";
import { logoutAction } from "@/features/admin/infrastructure/server-actions";
import {
  hasValidAdminSession,
  isAdminAuthConfigured,
} from "@/features/admin/infrastructure/admin-auth";

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
            aria-label="Jade's Açaí, voltar à loja"
            className="relative inline-flex w-fit items-center"
          >
            <Image
              src="/Logo.png"
              alt=""
              width={512}
              height={512}
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
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
            Jade&apos;s Açaí · Painel de operação
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
    <main className="min-h-screen w-full text-[#292923]">
      <div className="mx-auto flex min-h-screen max-w-full bg-cream">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 self-start border-r border-coral/40 bg-crimson px-5 py-7 md:flex md:flex-col">
          <Link
            href="/"
            aria-label="Jade's Açaí, voltar à loja"
            className="inline-flex w-fit items-center"
          >
            <Image
              src="/Logo.png"
              alt=""
              width={512}
              height={512}
              className="h-14 w-14 object-contain"
            />
          </Link>
          <p className="mt-10 px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-petal">
            Operação
          </p>
          <DesktopAdminNavigation />
          <div className="mt-auto border-t border-coral/40 pt-4">
            <p className="px-3 text-xs font-semibold text-petal">
              Sessão protegida
            </p>
            <form action={logoutAction}>
              <button className="mt-2 flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-sm font-bold text-petal transition-colors hover:bg-coral hover:text-crimson">
                <SignOutIcon aria-hidden="true" size={17} />
                Sair do painel
              </button>
            </form>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-6 pb-24 sm:px-8 sm:py-8 sm:pb-24 lg:px-11 md:pb-8">
          <header className="flex items-start justify-between gap-4 border-b border-[#deded7] pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.16em] text-[#8b1a2e]">
                <Image
                  src="/Logo.png"
                  alt=""
                  width={512}
                  height={512}
                  className="h-11 w-11 object-contain"
                />
                <span>Administração</span>
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Visão geral
              </h1>
            </div>
          </header>

          <div className="mt-6 space-y-12">
            <DashboardModule />
            <OrdersModule />
            <CatalogModule />
            <CouponsModule />
            <GeneralSettingsModule />
          </div>
        </section>
      </div>
      <MobileAdminMenu />
    </main>
  );
}
