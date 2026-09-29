import type { ReactNode } from "react";

export function ModuleEmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center border border-dashed border-[#d6d6ce] bg-white px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8eeee] text-[#8b1a2e]">
        {icon}
      </span>
      <h3 className="mt-4 text-sm font-extrabold text-[#33332d]">{title}</h3>
      <p className="mt-2 max-w-md text-xs leading-5 text-[#77776e]">
        {description}
      </p>
    </div>
  );
}
