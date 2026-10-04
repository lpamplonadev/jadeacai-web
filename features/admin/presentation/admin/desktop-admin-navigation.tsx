"use client";

import Link from "next/link";
import { adminSections } from "@/features/admin/presentation/admin/admin-sections";
import { useActiveAdminSection } from "@/features/admin/presentation/admin/use-active-admin-section";

export function DesktopAdminNavigation() {
  const activeSection = useActiveAdminSection();

  return (
    <nav aria-label="Módulos administrativos" className="mt-3 space-y-1">
      {adminSections.map((section) => {
        const active = activeSection === section.id;

        return (
          <Link
            key={section.id}
            href={`/admin#${section.id}`}
            aria-current={active ? "location" : undefined}
            className={`flex min-h-10 items-center rounded-md px-3 text-sm font-bold text-petal transition-colors ${active ? "border-l-2 border-petal bg-coral" : "hover:bg-coral/25"}`}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
