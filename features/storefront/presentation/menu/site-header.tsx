import { ShoppingCartIcon } from "@phosphor-icons/react";

const landingNavigation = [
  { label: "Início", href: "#inicio" },
  { label: "Cardápio", href: "#catalogo" },
  { label: "Monte seu açaí", href: "#monte-seu-acai" },
  { label: "Nossa história", href: "#sobre" },
];

export function SiteHeader({
  cartCount,
  storeIsOpen,
}: {
  cartCount: number;
  storeIsOpen: boolean;
}) {
  return (
    <header className="bg-dark z-10000 sticky top-0 shadow-[0_4px_16px_rgba(61,15,26,0.08)] backdrop-blur">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 md:px-8">
        <a
          href="#inicio"
          className="flex items-center gap-3"
          aria-label="Jade's Açaí, início"
        >
          <span
            style={{ fontFamily: "Pacifico, cursive" }}
            className="text-xl sm:text-4xl font-extrabold tracking-tight text-cream"
          >
            Jade&apos;s Açaí
          </span>
        </a>
        <nav aria-label="Navegação principal" className="hidden gap-6 md:flex">
          {landingNavigation.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-bold text-cream transition-colors hover:text-petal"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#order-summary"
            aria-label={`Sacola com ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
            title="Abrir sacola"
            className="relative flex h-10 min-w-10 items-center justify-center gap-1 rounded-md text-cream transition-colors hover:text-blush"
          >
            <ShoppingCartIcon aria-hidden="true" size={20} />
            <span className="text-xs font-extrabold">{cartCount}</span>
            <span className="sr-only sm:not-sr-only sm:text-xs sm:font-bold">Sacola</span>
          </a>
          {/* <a
            href="/admin"
            className="text-xs font-extrabold text-cream transition-colors hover:text-blush sm:text-sm"
          >
            Painel
          </a> */}
          {storeIsOpen ? (
            <a
              href="#monte-seu-acai"
              className="rounded-full bg-petal px-4 py-2 text-xs font-bold text-dark transition-colors hover:bg-blush sm:px-5 sm:text-sm"
            >
              Fazer pedido
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-full bg-neutral-400 px-4 py-2 text-xs font-bold text-white opacity-80 sm:px-5 sm:text-sm"
            >
              Loja fechada
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
