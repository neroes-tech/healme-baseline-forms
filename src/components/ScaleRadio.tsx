"use client";

// src/components/ScaleRadio.tsx
// Escala de radios reutilizável (0–4 e 0–10). Mobile-first, alvos de toque grandes.
// Acessível: role="radiogroup", labels associadas, navegação por teclado, foco visível.

type ScaleRadioProps = {
  name: string;
  min: number;
  max: number;
  value: number | null;
  onChange: (value: number) => void;
  // Âncoras textuais opcionais (ex.: PSS-10: Nunca … Muito frequente).
  labels?: readonly string[];
  legend: string;
  required?: boolean;
  error?: boolean;
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
}: ScaleRadioProps) {
  const options: number[] = [];
  for (let i = min; i <= max; i++) options.push(i);

  return (
    <fieldset className="w-full">
      <legend className="mb-3 block text-base font-medium leading-relaxed text-slate-900">
        {legend}
        {required && <span className="ml-1 text-red-600" aria-hidden="true">*</span>}
      </legend>

      <div
        role="radiogroup"
        aria-label={legend}
        aria-required={required}
        className={`flex flex-wrap gap-2 ${
          error ? "rounded-lg p-2 ring-2 ring-red-500" : ""
        }`}
      >
        {options.map((opt) => {
          const id = `${name}-${opt}`;
          const selected = value === opt;
          const anchor = labels?.[opt - min];
          return (
            <label
              key={opt}
              htmlFor={id}
              className={`flex min-w-[3.25rem] flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition select-none ${
                selected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-800 hover:border-slate-500"
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
              <span className="text-lg font-semibold tabular-nums">{opt}</span>
              {anchor && (
                <span
                  className={`text-[0.7rem] leading-tight ${
                    selected ? "text-slate-100" : "text-slate-500"
                  }`}
                >
                  {anchor}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
