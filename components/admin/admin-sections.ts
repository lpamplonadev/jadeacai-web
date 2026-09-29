export const adminSections = [
  { id: "dashboard", label: "Dashboard" },
  { id: "pedidos", label: "Pedidos" },
  { id: "catalogo", label: "Catálogo" },
  { id: "cupons", label: "Cupons" },
] as const;

export type AdminSectionId = (typeof adminSections)[number]["id"];
