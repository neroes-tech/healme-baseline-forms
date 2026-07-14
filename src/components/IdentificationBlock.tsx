"use client";

// src/components/IdentificationBlock.tsx
// Bloco de identificação comum aos dois formulários (secção 9 da SPEC).
// SEM CAMPO DE NOME. Em lado nenhum. Nunca.
// Campos read-only (ID/Língua/Timepoint/Versão) são apresentados como <dl> — saem da
// ordem de tabulação e deixam de parecer editáveis. Data/Hora ficam inputs editáveis.
// "Grupo" e "Preenchido por" são radiogroups acessíveis (fieldset/legend).

import type { FilledBy, IdentificationValues, StudyGroup } from "@/lib/types";

type Props = {
  values: IdentificationValues;
  onChange: (patch: Partial<IdentificationValues>) => void;
  showGroup?: boolean;
  showFormVersion?: boolean;
  timepointLabel?: string;
};

const GROUPS: { value: StudyGroup; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "vacation", label: "Vacation" },
  { value: "waitlist", label: "Waitlist" },
];

const chipBase =
  "flex min-h-13 cursor-pointer select-none items-center gap-2 rounded-md border-2 px-5 py-3 text-[1.0625rem] font-medium transition";
const chipOn = "border-brand-hover bg-selected text-brand-contrast shadow-sm";
const chipOff =
  "border-control bg-surface text-ink hover:border-brand hover:bg-brand-tint";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.8125rem] font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-[1.0625rem] font-semibold tabular-nums text-ink">
        {value}
      </dd>
    </div>
  );
}

export default function IdentificationBlock({
  values,
  onChange,
  showGroup = false,
  showFormVersion = false,
  timepointLabel = "Baseline",
}: Props) {
  return (
    <section
      aria-labelledby="id-block-heading"
      className="rounded-lg bg-surface-alt p-4 sm:p-5"
    >
      <h2 id="id-block-heading" className="sr-only">
        Identificação
      </h2>

      {/* Campos read-only, semânticos e fora da tabulação */}
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <ReadOnlyField label="ID do participante" value={values.polarId} />
        <ReadOnlyField label="Timepoint" value={timepointLabel} />
        <ReadOnlyField label="Língua" value={values.language} />
        {showFormVersion && (
          <ReadOnlyField label="Versão do formulário" value={values.formVersion} />
        )}
      </dl>

      {/* Campos editáveis: Data e Hora de início */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="form-date"
            className="mb-1.5 block text-[0.8125rem] font-semibold text-muted"
          >
            Data
          </label>
          <input
            id="form-date"
            type="date"
            value={values.formDate}
            onChange={(e) => onChange({ formDate: e.target.value })}
            className="min-h-13 w-full rounded-sm border border-control bg-surface px-3.5 py-3 text-[1.0625rem] text-ink focus-visible:border-brand"
          />
        </div>
        <div>
          <label
            htmlFor="start-time"
            className="mb-1.5 block text-[0.8125rem] font-semibold text-muted"
          >
            Hora de início
          </label>
          <input
            id="start-time"
            type="time"
            value={values.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className="min-h-13 w-full rounded-sm border border-control bg-surface px-3.5 py-3 text-[1.0625rem] tabular-nums text-ink focus-visible:border-brand"
          />
        </div>
      </div>

      {/* Grupo — só HEAL-ME */}
      {showGroup && (
        <fieldset className="mt-4">
          <legend className="mb-2 block text-[0.8125rem] font-semibold text-muted">
            Grupo
          </legend>
          <div role="radiogroup" aria-label="Grupo" className="flex flex-wrap gap-2">
            {GROUPS.map((g) => {
              const selected = values.studyGroup === g.value;
              return (
                <label
                  key={g.value}
                  className={`${chipBase} ${selected ? chipOn : chipOff}`}
                >
                  <input
                    type="radio"
                    name="study-group"
                    value={g.value}
                    checked={selected}
                    onChange={() => onChange({ studyGroup: g.value })}
                    className="sr-only"
                  />
                  {g.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Preenchido por — obrigatório */}
      <fieldset className="mt-4">
        <legend className="mb-2 block text-[0.8125rem] font-semibold text-muted">
          Preenchido por{" "}
          <span className="text-error" aria-hidden="true">
            *
          </span>
        </legend>
        <div
          role="radiogroup"
          aria-label="Preenchido por"
          aria-required="true"
          className="flex flex-wrap gap-2"
        >
          {(
            [
              { value: "participante", label: "Participante" },
              { value: "operador", label: "Operador" },
            ] as { value: FilledBy; label: string }[]
          ).map((f) => {
            const selected = values.filledBy === f.value;
            return (
              <label
                key={f.value}
                className={`${chipBase} ${selected ? chipOn : chipOff}`}
              >
                <input
                  type="radio"
                  name="filled-by"
                  value={f.value}
                  checked={selected}
                  onChange={() => onChange({ filledBy: f.value })}
                  className="sr-only"
                />
                {f.label}
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
