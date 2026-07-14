"use client";

// src/app/preencher/baseline/BaselineForm.tsx
// Formulário 2 (HEAL-ME Baseline Mínimo). Texto verbatim de @/content/healme-baseline (NÃO alterar).
// TODOS os campos são opcionais — o participante pode deixar qualquer pergunta em branco.
// Ao submeter: INSERT em healme_baseline_responses + marca a sessão como completed.
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDraft } from "@/lib/useDraft";
import type { FilledBy, IdentificationValues, StudyGroup } from "@/lib/types";
import Footer from "@/components/Footer";
import IdentificationBlock from "@/components/IdentificationBlock";
import ProgressBar from "@/components/ProgressBar";
import ScaleRadio from "@/components/ScaleRadio";
import {
  HEALME_CONFIRMACAO,
  HEALME_HEADER,
  HEALME_INSTRUCTIONS,
  HEALME_PAGE_MARK,
  HEALME_SCALE_MAX,
  HEALME_SCALE_MIN,
  NOTAS_LABEL,
  SECAO_BEM_ESTAR,
  SECAO_CONEXAO,
  SECAO_ENRAIZAMENTO,
  SECAO_SIGNIFICADO,
  SECAO_SONO,
  type ScaleItem,
} from "@/content/healme-baseline";

type ScaleValues = Record<string, number | null>;
type NoteValues = Record<string, string>;

type SonoState = {
  horaDeitar: string;
  horaAcordar: string;
  horas: string;
  minutos: string;
  qualidade: number | null;
  fadiga: number | null;
  sintomas: "sim" | "nao" | "";
  sintomasDesc: string;
};

type DraftShape = {
  ident: IdentificationValues;
  scales: ScaleValues;
  notes: NoteValues;
  sono: SonoState;
  confirmacaoIniciais: string;
};

type Props = {
  sessionId: string;
  participantId: string;
  polarId: string;
  studyGroup: StudyGroup | null;
  defaultDate: string;
  defaultStartTime: string;
};

function toIntOrNull(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number.parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}
function toTextOrNull(s: string): string | null {
  return s.trim() === "" ? null : s;
}

// Classes reutilizáveis
const inputClass =
  "min-h-13 w-full rounded-sm border border-control bg-surface px-3.5 py-3 text-[1.0625rem] text-ink placeholder:text-placeholder focus-visible:border-brand";
const numInputClass =
  "min-h-13 w-24 rounded-sm border border-control bg-surface px-3.5 py-3 text-[1.0625rem] tabular-nums text-ink focus-visible:border-brand";
const textareaClass =
  "min-h-[5.5rem] w-full resize-y rounded-sm border border-control bg-surface px-3.5 py-3 text-[1.0625rem] leading-relaxed text-ink placeholder:text-placeholder focus-visible:border-brand";
const cardClass =
  "rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5";
const chipBase =
  "flex min-h-13 cursor-pointer select-none items-center gap-2 rounded-md border-2 px-5 py-3 text-[1.0625rem] font-medium transition";
const chipOn = "border-brand-hover bg-selected text-brand-contrast shadow-sm";
const chipOff =
  "border-control bg-surface text-ink hover:border-brand hover:bg-brand-tint";

export default function BaselineForm({
  sessionId,
  participantId,
  polarId,
  studyGroup,
  defaultDate,
  defaultStartTime,
}: Props) {
  const router = useRouter();

  const initial: DraftShape = useMemo(
    () => ({
      ident: {
        polarId,
        formDate: defaultDate,
        startTime: defaultStartTime,
        studyGroup,
        timepoint: "Baseline",
        language: "Português",
        filledBy: "participante" as FilledBy,
        formVersion: "v1.0",
      },
      scales: {},
      notes: {},
      sono: {
        horaDeitar: "",
        horaAcordar: "",
        horas: "",
        minutos: "",
        qualidade: null,
        fadiga: null,
        sintomas: "",
        sintomasDesc: "",
      },
      confirmacaoIniciais: "",
    }),
    [polarId, studyGroup, defaultDate, defaultStartTime],
  );

  const { data, setData, clearDraft } = useDraft<DraftShape>(
    `baseline:${sessionId}`,
    initial,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sintomasDescRef = useRef<HTMLInputElement | null>(null);

  // Ao escolher "Sim" nos sintomas, levar o foco ao campo de descrição.
  useEffect(() => {
    if (data.sono.sintomas === "sim") sintomasDescRef.current?.focus();
  }, [data.sono.sintomas]);

  function setIdent(patch: Partial<IdentificationValues>) {
    setData((d) => ({ ...d, ident: { ...d.ident, ...patch } }));
  }
  function setScale(key: string, value: number) {
    setData((d) => ({ ...d, scales: { ...d.scales, [key]: value } }));
  }
  function setNote(key: string, value: string) {
    setData((d) => ({ ...d, notes: { ...d.notes, [key]: value } }));
  }
  function setSono(patch: Partial<SonoState>) {
    setData((d) => ({ ...d, sono: { ...d.sono, ...patch } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const s = data.scales;
    const n = data.notes;

    const row = {
      session_id: sessionId,
      participant_id: participantId,
      polar_id: polarId,
      form_date: data.ident.formDate,
      start_time: data.ident.startTime,
      study_group: data.ident.studyGroup,
      timepoint: data.ident.timepoint,
      language: data.ident.language,
      filled_by: data.ident.filledBy,
      form_version: data.ident.formVersion,

      // 1. Bem-estar
      wb_geral: s.wb_geral ?? null,
      wb_geral_notas: toTextOrNull(n.wb_geral_notas ?? ""),
      wb_lidar_exigencias: s.wb_lidar_exigencias ?? null,
      wb_lidar_exigencias_notas: toTextOrNull(n.wb_lidar_exigencias_notas ?? ""),
      wb_satisfacao_vida: s.wb_satisfacao_vida ?? null,
      wb_satisfacao_vida_notas: toTextOrNull(n.wb_satisfacao_vida_notas ?? ""),

      // 2. Sono
      sono_hora_deitar: toTextOrNull(data.sono.horaDeitar),
      sono_hora_acordar: toTextOrNull(data.sono.horaAcordar),
      sono_horas: toIntOrNull(data.sono.horas),
      sono_minutos: toIntOrNull(data.sono.minutos),
      sono_qualidade: data.sono.qualidade,
      fadiga_agora: data.sono.fadiga,
      sintomas_fisicos:
        data.sono.sintomas === "" ? null : data.sono.sintomas === "sim",
      sintomas_fisicos_desc: toTextOrNull(data.sono.sintomasDesc),

      // 3. Significado
      sig_proposito: s.sig_proposito ?? null,
      sig_proposito_notas: toTextOrNull(n.sig_proposito_notas ?? ""),
      sig_clareza: s.sig_clareza ?? null,
      sig_clareza_notas: toTextOrNull(n.sig_clareza_notas ?? ""),
      sig_ligacao_maior: s.sig_ligacao_maior ?? null,
      sig_ligacao_maior_notas: toTextOrNull(n.sig_ligacao_maior_notas ?? ""),

      // 4. Conexão
      con_conectado: s.con_conectado ?? null,
      con_conectado_notas: toTextOrNull(n.con_conectado_notas ?? ""),
      con_apoiado: s.con_apoiado ?? null,
      con_apoiado_notas: toTextOrNull(n.con_apoiado_notas ?? ""),
      con_seguranca_grupo: s.con_seguranca_grupo ?? null,
      con_seguranca_grupo_notas: toTextOrNull(n.con_seguranca_grupo_notas ?? ""),

      // 5. Enraizamento
      enr_estavel: s.enr_estavel ?? null,
      enr_estavel_notas: toTextOrNull(n.enr_estavel_notas ?? ""),
      enr_presente_corpo: s.enr_presente_corpo ?? null,
      enr_presente_corpo_notas: toTextOrNull(n.enr_presente_corpo_notas ?? ""),
      enr_voltar_calma: s.enr_voltar_calma ?? null,
      enr_voltar_calma_notas: toTextOrNull(n.enr_voltar_calma_notas ?? ""),

      // Confirmação final
      confirmacao_iniciais: toTextOrNull(data.confirmacaoIniciais),
      concluido_em: new Date().toISOString(),
    };

    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("healme_baseline_responses")
      .insert(row);

    if (insertError) {
      setSubmitting(false);
      setError(
        "Não foi possível guardar. Verifique a ligação e tente de novo — as suas respostas não se perderam.",
      );
      return;
    }

    const { error: updateError } = await supabase
      .from("form_sessions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (updateError) {
      // A resposta ficou guardada; falhou apenas o estado da sessão. Continua.
    }

    clearDraft();
    router.replace("/concluido");
  }

  // Renderiza uma secção 0–10 com notas opcionais.
  function renderScaleSection(section: {
    numero: string;
    titulo: string;
    periodo: string;
    itens: readonly ScaleItem[];
  }) {
    const headingId = `sec-${section.numero}-h`;
    return (
      <section key={section.numero} aria-labelledby={headingId}>
        <h2 id={headingId} className="text-[1.375rem] font-semibold text-ink">
          {section.numero}. {section.titulo}
        </h2>
        <p className="mb-4 mt-1 text-[0.9375rem] italic text-muted">
          {section.periodo}
        </p>
        <div className="space-y-6">
          {section.itens.map((item) => (
            <div key={item.key} className={cardClass}>
              <ScaleRadio
                name={`hm-${item.key}`}
                min={HEALME_SCALE_MIN}
                max={HEALME_SCALE_MAX}
                value={data.scales[item.key] ?? null}
                onChange={(v) => setScale(item.key, v)}
                legend={item.text}
              />
              <div className="mt-3">
                <label
                  htmlFor={`note-${item.notasKey}`}
                  className="mb-1.5 block text-[0.8125rem] font-semibold text-muted"
                >
                  {NOTAS_LABEL}
                </label>
                <textarea
                  id={`note-${item.notasKey}`}
                  value={data.notes[item.notasKey] ?? ""}
                  onChange={(e) => setNote(item.notasKey, e.target.value)}
                  rows={2}
                  className={textareaClass}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6">
        <ProgressBar current={2} total={2} label="HEAL-ME Baseline" />

        {/* Cabeçalho verbatim */}
        <header className="mb-6 text-center">
          <p className="text-[0.8125rem] font-semibold uppercase tracking-wide text-brand">
            {HEALME_HEADER.study}
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold text-ink">
            {HEALME_HEADER.title}
          </h1>
          <p className="mt-1 text-[1.0625rem] italic text-muted">
            {HEALME_HEADER.subtitle}
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <IdentificationBlock
            values={data.ident}
            onChange={setIdent}
            showGroup
            showFormVersion
            timepointLabel="Baseline T-14 a T-7"
          />

          {/* Instruções verbatim */}
          <div className="space-y-2 rounded-lg bg-surface-alt p-4 text-[1.0625rem] leading-relaxed text-ink">
            <p>{HEALME_INSTRUCTIONS.responder}</p>
            <p>{HEALME_INSTRUCTIONS.escala}</p>
            <p>{HEALME_INSTRUCTIONS.notaPss10}</p>
          </div>

          {/* 1. Bem-estar */}
          {renderScaleSection(SECAO_BEM_ESTAR)}

          {/* 2. Sono */}
          <section aria-labelledby="sec-sono-h">
            <h2
              id="sec-sono-h"
              className="text-[1.375rem] font-semibold text-ink"
            >
              {SECAO_SONO.numero}. {SECAO_SONO.titulo}
            </h2>
            <p className="mb-4 mt-1 text-[0.9375rem] italic text-muted">
              {SECAO_SONO.periodo}
            </p>
            <div className="space-y-6">
              <div className={cardClass}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="hora-deitar"
                      className="mb-1.5 block text-[1.0625rem] font-medium text-ink"
                    >
                      {SECAO_SONO.perguntas.horaDeitar}
                    </label>
                    <input
                      id="hora-deitar"
                      type="time"
                      value={data.sono.horaDeitar}
                      onChange={(e) => setSono({ horaDeitar: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="hora-acordar"
                      className="mb-1.5 block text-[1.0625rem] font-medium text-ink"
                    >
                      {SECAO_SONO.perguntas.horaAcordar}
                    </label>
                    <input
                      id="hora-acordar"
                      type="time"
                      value={data.sono.horaAcordar}
                      onChange={(e) => setSono({ horaAcordar: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <fieldset className="mt-4">
                  <legend className="mb-1.5 block text-[1.0625rem] font-medium text-ink">
                    {SECAO_SONO.perguntas.duracao}
                  </legend>
                  <div className="flex items-end gap-3">
                    <div>
                      <label
                        htmlFor="sono-horas"
                        className="mb-1 block text-[0.8125rem] font-semibold text-muted"
                      >
                        Horas
                      </label>
                      <input
                        id="sono-horas"
                        type="number"
                        min={0}
                        max={24}
                        inputMode="numeric"
                        value={data.sono.horas}
                        onChange={(e) => setSono({ horas: e.target.value })}
                        className={numInputClass}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="sono-minutos"
                        className="mb-1 block text-[0.8125rem] font-semibold text-muted"
                      >
                        Minutos
                      </label>
                      <input
                        id="sono-minutos"
                        type="number"
                        min={0}
                        max={59}
                        inputMode="numeric"
                        value={data.sono.minutos}
                        onChange={(e) => setSono({ minutos: e.target.value })}
                        className={numInputClass}
                      />
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* Qualidade + fadiga (0–10) */}
              <div className={cardClass}>
                <ScaleRadio
                  name="hm-sono_qualidade"
                  min={HEALME_SCALE_MIN}
                  max={HEALME_SCALE_MAX}
                  value={data.sono.qualidade}
                  onChange={(v) => setSono({ qualidade: v })}
                  legend={SECAO_SONO.perguntas.qualidade}
                />
              </div>
              <div className={cardClass}>
                <ScaleRadio
                  name="hm-fadiga_agora"
                  min={HEALME_SCALE_MIN}
                  max={HEALME_SCALE_MAX}
                  value={data.sono.fadiga}
                  onChange={(v) => setSono({ fadiga: v })}
                  legend={SECAO_SONO.perguntas.fadiga}
                />
              </div>

              {/* Sintomas físicos */}
              <div className={cardClass}>
                <fieldset>
                  <legend className="mb-2 block text-[1.0625rem] font-medium text-ink">
                    {SECAO_SONO.perguntas.sintomas}
                  </legend>
                  <div
                    role="radiogroup"
                    aria-label={SECAO_SONO.perguntas.sintomas}
                    className="flex gap-2"
                  >
                    {(
                      [
                        { value: "nao", label: "Não" },
                        { value: "sim", label: "Sim" },
                      ] as { value: "sim" | "nao"; label: string }[]
                    ).map((opt) => {
                      const selected = data.sono.sintomas === opt.value;
                      return (
                        <label
                          key={opt.value}
                          className={`${chipBase} ${selected ? chipOn : chipOff}`}
                        >
                          <input
                            type="radio"
                            name="sintomas"
                            value={opt.value}
                            checked={selected}
                            onChange={() => setSono({ sintomas: opt.value })}
                            className="sr-only"
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div aria-live="polite">
                  {data.sono.sintomas === "sim" && (
                    <div className="mt-3">
                      <label
                        htmlFor="sintomas-desc"
                        className="mb-1.5 block text-[0.8125rem] font-semibold text-muted"
                      >
                        {SECAO_SONO.perguntas.sintomasSeSim}
                      </label>
                      <input
                        id="sintomas-desc"
                        ref={sintomasDescRef}
                        type="text"
                        value={data.sono.sintomasDesc}
                        onChange={(e) => setSono({ sintomasDesc: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 3. Significado */}
          {renderScaleSection(SECAO_SIGNIFICADO)}
          {/* 4. Conexão */}
          {renderScaleSection(SECAO_CONEXAO)}
          {/* 5. Enraizamento */}
          {renderScaleSection(SECAO_ENRAIZAMENTO)}

          {/* Confirmação final */}
          <section aria-labelledby="sec-conf-h">
            <h2
              id="sec-conf-h"
              className="text-[1.375rem] font-semibold text-ink"
            >
              {HEALME_CONFIRMACAO.titulo}
            </h2>
            <p className="mt-2 rounded-lg bg-surface-alt p-4 text-[1.0625rem] leading-relaxed text-ink">
              {HEALME_CONFIRMACAO.texto}
            </p>
            <div className={`mt-4 ${cardClass}`}>
              <label
                htmlFor="iniciais"
                className="mb-1.5 block text-[1.0625rem] font-medium text-ink"
              >
                {HEALME_CONFIRMACAO.labelIniciais}
              </label>
              <input
                id="iniciais"
                type="text"
                value={data.confirmacaoIniciais}
                onChange={(e) =>
                  setData((d) => ({ ...d, confirmacaoIniciais: e.target.value }))
                }
                className={inputClass}
              />
              <p className="mt-3 text-[0.9375rem] text-muted">
                {HEALME_CONFIRMACAO.labelDataHora}: preenchido automaticamente na
                submissão.
              </p>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-1.5 rounded-md border-l-4 border-error bg-error-bg p-4 text-[0.9375rem] font-medium text-error"
            >
              <span aria-hidden="true">⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-13 w-full items-center justify-center rounded-md bg-brand px-6 py-3.5 text-[1.0625rem] font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0"
          >
            {submitting ? "A guardar…" : "Concluir preenchimento"}
          </button>

          <footer className="border-t border-line pt-4 text-center text-[0.75rem] text-muted">
            {HEALME_PAGE_MARK}
          </footer>
        </form>
      </main>
      <Footer />
    </div>
  );
}
