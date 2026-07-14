"use client";

// src/components/ScaleRadio.tsx
// Escala de radios reutilizável (0–4 e 0–10). Mobile-first, alvos de toque grandes.
// Acessível: fieldset/legend, role="radiogroup", labels associadas, teclado, foco visível,
// estado selecionado NÃO só por cor (preenchimento + borda + número + glifo ✓).

type ScaleRadioProps = {
  name: string;
  min: number;
  max: number;
  value: number | null;
  onChange: (value: number) => void;
  // Âncoras textuais opcionais. Se houver uma por opção (ex.: PSS-10 0–4), mostram-se
  // sob cada número. Se forem só 2 (min/max), mostram-se acima da grelha.
  labels?: readonly string[];
  legend: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
};

export default function ScaleRadio({
  name,
  min,
  max,
  value,
  onChange,
  labels,
  legend,
  required = false,
  error = false,
  errorMessage = "Falta responder a esta questão.",
}: ScaleRadioProps) {
  const options: number[] = [];
  for (let i = min; i <= max; i++) options.push(i);
  const count = options.length;

  const perOptionAnchors = labels && labels.length === count;
  const extremeAnchors = labels && labels.length === 2;

  const legendId = `${name}-legend`;
  const errorId = `${name}-error`;

  // Grelha: 0–4 (5) numa linha; 0–10 (11) quebra em 6 colunas < 400px e 11 a partir daí.
  const gridClass =
    count === 11
      ? "grid grid-cols-6 gap-2 sm:grid-cols-11"
      : count === 5
        ? "grid grid-cols-5 gap-2"
        : "flex flex-wrap gap-2";

  return (
    <fieldset className="w-full">
      <legend
        id={legendId}
        className="mb-3 block text-[1.125rem] font-medium leading-relaxed text-ink"
      >
        {legend}
        {required && (
          <span className="ml-1 text-error" aria-hidden="true">
            *
          </span>
        )}
      </legend>

      {extremeAnchors && (
        <div className="mb-2 flex justify-between text-[0.8125rem] font-medium text-muted">
          <span>{labels![0]}</span>
          <span>{labels![1]}</span>
        </div>
      )}

      <div
        role="radiogroup"
        aria-labelledby={legendId}
        aria-required={required}
        aria-invalid={error || undefined}
        aria-describedby={error ? errorId : undefined}
        className={gridClass}
      >
        {options.map((opt) => {
          const id = `${name}-${opt}`;
          const selected = value === opt;
          const anchor = perOptionAnchors ? labels![opt - min] : undefined;
          return (
            <label
              key={opt}
              htmlFor={id}
              className={`group relative flex min-h-13 cursor-pointer select-none flex-col items-center justify-center gap-1 rounded-md border-2 px-2 py-3 text-center transition ${
                selected
                  ? "border-brand-hover bg-selected text-brand-contrast shadow-sm"
                  : "border-control bg-surface text-ink hover:border-brand hover:bg-brand-tint"
              }`}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={opt}
                checked={selected}
                onChange={() => onChange(opt)}
                required={required}
                className="sr-only"
              />
              {selected && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-1 top-1 text-[0.75rem] leading-none"
                >
                  ✓
                </span>
              )}
              <span className="text-[1.25rem] font-semibold tabular-nums">{opt}</span>
              {anchor && (
                <span
                  className={`text-[0.8125rem] leading-tight ${
                    selected ? "text-selected-anchor" : "text-muted"
                  }`}
                >
                  {anchor}
                </span>
              )}
            </label>
          );
        })}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-[0.9375rem] font-medium text-error"
        >
          <span aria-hidden="true">⚠</span> {errorMessage}
        </p>
      )}
    </fieldset>
  );
}
