"use client";

// src/components/IdentificationBlock.tsx
// Bloco de identificação comum aos dois formulários (secção 9 da SPEC).
// SEM CAMPO DE NOME. Em lado nenhum. Nunca.
// O ID do participante vem do perfil e é read-only.

import type { FilledBy, IdentificationValues, StudyGroup } from "@/lib/types";

type Props = {
  values: IdentificationValues;
  onChange: (patch: Partial<IdentificationValues>) => void;
  // O campo "Grupo", "Versão do formulário" e "Timepoint T-14 a T-7" só aparecem no HEAL-ME.
  showGroup?: boolean;
  showFormVersion?: boolean;
  timepointLabel?: string; // ex.: "Baseline" ou "Baseline T-14 a T-7"
};

const GROUPS: { value: StudyGroup; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "vacation", label: "Vacation" },
  { value: "waitlist", label: "Waitlist" },
];

export default function IdentificationBlock({
  values,
  onChange,
  showGroup = false,
  showFormVersion = false,
  timepointLabel = "Baseline",
}: Props) {
  return (
    <section
      aria-label="Identificação"
      className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* ID do participante — read-only, do perfil */}
        <div>
          <label
            htmlFor="id-participante"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            ID do participante
          </label>
          <input
            id="id-participante"
            type="text"
            value={values.polarId}
            readOnly
            aria-readonly="true"
            className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900"
          />
        </div>

        {/* Data — editável, pré-preenchida com hoje */}
        <div>
          <label
            htmlFor="form-date"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Data
          </label>
          <input
            id="form-date"
            type="date"
            value={values.formDate}
            onChange={(e) => onChange({ formDate: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          />
        </div>

        {/* Hora de início — editável, pré-preenchida com o início da sessão */}
        <div>
          <label
            htmlFor="start-time"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Hora de início
          </label>
          <input
            id="start-time"
            type="time"
            value={values.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
          />
        </div>

        {/* Língua — read-only */}
        <div>
          <label
            htmlFor="language"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Língua
          </label>
          <input
            id="language"
            type="text"
            value={values.language}
            readOnly
            aria-readonly="true"
            className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900"
          />
        </div>

        {/* Timepoint — read-only */}
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Timepoint
          </span>
          <div className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900">
            {timepointLabel}
          </div>
        </div>

        {/* Versão do formulário — read-only (só HEAL-ME) */}
        {showFormVersion && (
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Versão do formulário
            </span>
            <div className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900">
              {values.formVersion}
            </div>
          </div>
        )}

        {/* Grupo — só HEAL-ME (como no original) */}
        {showGroup && (
          <div className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Grupo
            </span>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((g) => {
                const selected = values.studyGroup === g.value;
                return (
                  <label
                    key={g.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2 transition ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 bg-white text-slate-800 hover:border-slate-500"
                    }`}
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
          </div>
        )}

        {/* Preenchido por — obrigatório, default Participante */}
        <div className="sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Preenchido por <span className="text-red-600" aria-hidden="true">*</span>
          </span>
          <div className="flex flex-wrap gap-2">
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
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2 transition ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-500"
                  }`}
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
        </div>
      </div>
    </section>
  );
}
