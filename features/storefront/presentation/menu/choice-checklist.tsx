import type { BuilderChoice } from "@/features/storefront/domain/acai-builder-data";

type ChoiceChecklistProps = {
  title: string;
  number: string;
  choices: BuilderChoice[];
  selected: string[];
  onToggle: (id: string) => void;
  priceLabel?: (choice: BuilderChoice) => string;
  description?: string;
};

export function ChoiceChecklist({
  title,
  number,
  choices,
  selected,
  onToggle,
  priceLabel,
  description,
}: ChoiceChecklistProps) {
  return (
    <fieldset>
      <legend className="text-lg font-extrabold text-crimson">
        <span className="mr-2 text-coral">{number}</span> {title}
      </legend>
      {description && (
        <p className="mt-1 text-sm text-crimson/75">{description}</p>
      )}
      <div className="mt-4 grid gap-x-6 sm:grid-cols-2">
        {choices.map((choice) => (
          <label
            key={choice.id}
            className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border-b border-blush/80 py-2 text-sm text-text"
          >
            <span className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(choice.id)}
                onChange={() => onToggle(choice.id)}
                className="h-4 w-4 accent-crimson"
              />
              <span className="font-semibold">{choice.name}</span>
            </span>
            {priceLabel && (
              <span className="shrink-0 text-xs font-semibold text-crimson/75">
                {priceLabel(choice)}
              </span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
