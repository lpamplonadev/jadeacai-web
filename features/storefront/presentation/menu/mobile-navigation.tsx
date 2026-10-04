import { navigation } from "@/features/storefront/presentation/menu/menu-data";

type MobileNavigationProps = {
  cartCount: number;
};

export function MobileNavigation({ cartCount }: MobileNavigationProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-blush bg-cream/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(61,15,26,0.08)] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex h-[4.5rem] max-w-lg items-center justify-around px-1">
        {navigation.map(({ label, icon, href, featured }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            aria-current={label === "Início" ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-colors ${featured ? "text-crimson" : "text-crimson hover:text-crimson"}`}
          >
            <span
              aria-hidden="true"
              className={`relative flex items-center justify-center ${featured ? "-mt-7 h-14 w-14 rounded-full bg-crimson text-white shadow-lg ring-4 ring-cream" : "h-7 w-7"}`}
            >
              <span className={featured ? "text-2xl" : "text-xl"}>{icon}</span>
              {featured && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="max-w-full truncate text-[10px] font-medium">
              {label}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}
