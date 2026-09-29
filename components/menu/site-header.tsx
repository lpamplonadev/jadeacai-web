const landingNavigation = [
  { label: "Início", href: "#inicio" },
  { label: "Cardápio", href: "#catalogo" },
  { label: "Monte seu açaí", href: "#monte-seu-acai" },
  { label: "Nossa história", href: "#sobre" },
];

export function SiteHeader() {
  return (
    <header className="bg-dark z-10000 sticky top-0 shadow-[0_4px_16px_rgba(61,15,26,0.08)] backdrop-blur">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 md:px-8">
        <a
          href="#inicio"
          className="flex items-center gap-3"
          aria-label="Jade Açaí, início"
        >
          <span
            style={{ fontFamily: "Pacifico, cursive" }}
            className="text-xl sm:text-4xl font-extrabold tracking-tight text-cream"
          >
            Jade Açaí
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
        <a
          href="#monte-seu-acai"
          className="rounded-full bg-petal px-5 py-2 text-sm font-bold text-dark transition-colors hover:bg-blush"
        >
          Fazer pedido
        </a>
      </div>
    </header>
  );
}
