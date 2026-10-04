"use client";

import { useState } from "react";
import Link from "next/link";
import { ListIcon, SignOutIcon, XIcon } from "@phosphor-icons/react";
import { logoutAction } from "@/features/admin/infrastructure/server-actions";
import { adminSections } from "@/features/admin/presentation/admin/admin-sections";
import { useActiveAdminSection } from "@/features/admin/presentation/admin/use-active-admin-section";

import {
  ChartBarIcon,
  ClipboardTextIcon,
  PackageIcon,
  TicketIcon,
} from "@phosphor-icons/react";

const sectionIcons = {
  dashboard: ChartBarIcon,
  pedidos: ClipboardTextIcon,
  catalogo: PackageIcon,
  cupons: TicketIcon,
};

export function MobileAdminMenu() {
  const [expanded, setExpanded] = useState(false);
  const activeSection = useActiveAdminSection();

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+16px)] z-50 flex justify-end px-4 md:hidden">
      <div className="flex max-w-full items-center justify-end gap-2">
        <nav
          id="mobile-admin-navigation"
          aria-label="Módulos administrativos"
          aria-hidden={!expanded}
          className={`flex items-center gap-1 overflow-x-auto rounded-full border border-coral/50 bg-crimson py-1 shadow-[0_8px_28px_rgba(61,15,26,0.3)] transition-[max-width,opacity,transform,padding] duration-300 ${expanded ? "max-w-[calc(100vw-5rem)] translate-x-0 px-1.5 opacity-100" : "max-w-0 translate-x-3 px-0 opacity-0"}`}
          style={{
            scrollbarWidth: "none",
            visibility: expanded ? "visible" : "hidden",
          }}
        >
          {adminSections.map(({ id, label }) => {
            const Icon = sectionIcons[id];
            const active = activeSection === id;

            return (
              <Link
                key={id}
                href={`/admin#${id}`}
                aria-label={label}
                aria-current={active ? "location" : undefined}
                title={label}
                tabIndex={expanded ? 0 : -1}
                onClick={() => setExpanded(false)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-petal transition-colors ${active ? "bg-coral" : "hover:bg-coral/25"}`}
              >
                <Icon aria-hidden="true" size={16} />
              </Link>
            );
          })}
          <form action={logoutAction} className="shrink-0">
            <button
              type="submit"
              tabIndex={expanded ? 0 : -1}
              aria-label="Sair do painel"
              title="Sair do painel"
              className="flex h-10 w-10 items-center justify-center rounded-full text-petal transition-colors hover:bg-coral/25"
            >
              <SignOutIcon aria-hidden="true" size={18} />
            </button>
          </form>
        </nav>

        <button
          type="button"
          aria-label={expanded ? "Fechar menu" : "Abrir menu"}
          aria-expanded={expanded}
          aria-controls="mobile-admin-navigation"
          onClick={() => setExpanded((current) => !current)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-crimson text-petal shadow-[0_8px_24px_rgba(61,15,26,0.3)] transition-transform hover:scale-105 active:scale-95"
        >
          {expanded ? (
            <XIcon aria-hidden="true" size={22} weight="bold" />
          ) : (
            <ListIcon aria-hidden="true" size={23} weight="bold" />
          )}
        </button>
      </div>
    </div>
  );
}
