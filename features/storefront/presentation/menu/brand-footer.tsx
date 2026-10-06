import { ArrowRightIcon } from "@phosphor-icons/react";

export function BrandFooter({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section id="sobre" className="bg-dark px-5 py-10 text-white md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-lg font-extrabold">{title}</p>
          <p className="mt-1 text-sm text-blush">{body}</p>
        </div>
        <a
          href="#catalogo"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-white transition-colors hover:text-blush"
        >
          Conheça o cardápio <ArrowRightIcon aria-hidden="true" size={16} />
        </a>
      </div>
    </section>
  );
}
