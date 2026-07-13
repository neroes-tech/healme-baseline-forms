"use client";

// src/app/preencher/baseline/BaselineForm.tsx
// Formulário 2 (HEAL-ME Baseline Mínimo). Texto verbatim de @/content/healme-baseline.
// TODOS os campos são opcionais — o participante pode deixar qualquer pergunta em branco.
// Ao submeter: INSERT em healme_baseline_responses + marca a sessão como completed.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDraft } from "@/lib/useDraft";
import type { FilledBy, IdentificationValues, StudyGroup } from "@/lib/types";
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

    // Marca a sessão como concluída.
    const { error: updateError } = await supabase
      .from("form_sessions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (updateError) {
      // A resposta ficou guardada; falhou apenas o estado da sessão. Continua.
      // (O dashboard reconcilia: a sessão com baseline presente é tratada como concluída.)
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
    return (
      <section
        key={section.numero}
        aria-label={`${section.numero}. ${section.titulo}`}
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {section.numero}. {section.titulo}
        </h2>
        <p className="mb-4 text-sm italic text-slate-500">{section.periodo}</p>
        <div className="space-y-6">
          {section.itens.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
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
                  className="mb-1 block text-sm font-medium text-slate-600"
                >
                  {NOTAS_LABEL}
                </label>
                <textarea
                  id={`note-${item.notasKey}`}
                  value={data.notes[item.notasKey] ?? ""}
                  onChange={(e) => setNote(item.notasKey, e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <ProgressBar current={2} total={2} label="HEAL-ME Baseline" />

      {/* Cabeçalho verbatim */}
      <header className="mb-6 text-center">
        <p className="text-sm font-semibold text-slate-700">
          {HEALME_HEADER.study}
        </p>
        <h1 className="text-xl font-bold text-slate-900">
          {HEALME_HEADER.title}
        </h1>
        <p className="mt-1 text-sm italic text-slate-600">
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
        <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
          <p>{HEALME_INSTRUCTIONS.responder}</p>
          <p>{HEALME_INSTRUCTIONS.escala}</p>
          <p>{HEALME_INSTRUCTIONS.notaPss10}</p>
        </div>

        {/* 1. Bem-estar */}
        {renderScaleSection(SECAO_BEM_ESTAR)}

        {/* 2. Sono */}
        <section aria-label={`${SECAO_SONO.numero}. ${SECAO_SONO.titulo}`}>
          <h2 className="text-lg font-semibold text-slate-900">
            {SECAO_SONO.numero}. {SECAO_SONO.titulo}
          </h2>
          <p className="mb-4 text-sm italic text-slate-500">
            {SECAO_SONO.periodo}
          </p>
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="hora-deitar"
                    className="mb-1 block text-base font-medium text-slate-900"
                  >
                    {SECAO_SONO.perguntas.horaDeitar}
                  </label>
                  <input
                    id="hora-deitar"
                    type="time"
                    value={data.sono.horaDeitar}
                    onChange={(e) => setSono({ horaDeitar: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="hora-acordar"
                    className="mb-1 block text-base font-medium text-slate-900"
                  >
                    {SECAO_SONO.perguntas.horaAcordar}
                  </label>
                  <input
                    id="hora-acordar"
                    type="time"
                    value={data.sono.horaAcordar}
                    onChange={(e) => setSono({ horaAcordar: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="mt-4">
                <span className="mb-1 block text-base font-medium text-slate-900">
                  {SECAO_SONO.perguntas.duracao}
                </span>
                <div className="flex items-end gap-3">
                  <div>
                    <label
                      htmlFor="sono-horas"
                      className="mb-1 block text-sm text-slate-600"
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
                      className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sono-minutos"
                      className="mb-1 block text-sm text-slate-600"
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
                      className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Qualidade + fadiga (0–10) */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <ScaleRadio
                name="hm-sono_qualidade"
                min={HEALME_SCALE_MIN}
                max={HEALME_SCALE_MAX}
                value={data.sono.qualidade}
                onChange={(v) => setSono({ qualidade: v })}
                legend={SECAO_SONO.perguntas.qualidade}
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
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
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <span className="mb-2 block text-base font-medium text-slate-900">
                {SECAO_SONO.perguntas.sintomas}
              </span>
              <div className="flex gap-2">
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
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-5 py-2 transition ${
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white text-slate-800 hover:border-slate-500"
                      }`}
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
              {data.sono.sintomas === "sim" && (
                <div className="mt-3">
                  <label
                    htmlFor="sintomas-desc"
                    className="mb-1 block text-sm font-medium text-slate-600"
                  >
                    {SECAO_SONO.perguntas.sintomasSeSim}
                  </label>
                  <input
                    id="sintomas-desc"
                    type="text"
                    value={data.sono.sintomasDesc}
                    onChange={(e) => setSono({ sintomasDesc: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                  />
                </div>
              )}
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
        <section aria-label={HEALME_CONFIRMACAO.titulo}>
          <h2 className="text-lg font-semibold text-slate-900">
            {HEALME_CONFIRMACAO.titulo}
          </h2>
          <p className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {HEALME_CONFIRMACAO.texto}
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <label
              htmlFor="iniciais"
              className="mb-1 block text-base font-medium text-slate-900"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
            />
            <p className="mt-3 text-sm text-slate-500">
              {HEALME_CONFIRMACAO.labelDataHora}: preenchido automaticamente na
              submissão.
            </p>
          </div>
        </section>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {submitting ? "A guardar…" : "Concluir preenchimento"}
        </button>

        <footer className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
          {HEALME_PAGE_MARK}
        </footer>
      </form>
    </main>
  );
}
