"use client";

// src/components/IdentificationBlock.tsx
// Bloco de identificação comum aos dois formulários (secção 9 da SPEC).
// SEM CAMPO DE NOME. Em lado nenhum. Nunca.
// Campos read-only (ID/Língua/Timepoint/Versão) são apresentados como <dl> — saem da
// ordem de tabulação e deixam de parecer editáveis. Data/Hora ficam inputs editáveis.
// Por decisão da equipa, os seletores "Grupo" e "Preenchido por" foram removidos:
// o valor de filled_by é sempre "participante"; study_group vem do perfil (ou fica null).

import type { IdentificationValues } from "@/lib/types";

type Props = {
  values: IdentificationValues;
  onChange: (patch: Partial<IdentificationValues>) => void;
  showFormVersion?: boolean;
  timepointLabel?: string;
};

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
    </section>
  );
}
