"use client";

// src/app/preencher/pss10/Pss10Form.tsx
// Formulário 1 (PSS-10). Texto verbatim vem de @/content/pss10 (NÃO alterar).
// Os 10 itens são obrigatórios. A pontuação NUNCA é mostrada.
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDraft } from "@/lib/useDraft";
import type { FilledBy, IdentificationValues, StudyGroup } from "@/lib/types";
import Footer from "@/components/Footer";
import IdentificationBlock from "@/components/IdentificationBlock";
import ProgressBar from "@/components/ProgressBar";
import ScaleRadio from "@/components/ScaleRadio";
import {
  PSS10_ATTRIBUTION,
  PSS10_HEADER,
  PSS10_INSTRUCTION,
  PSS10_ITEMS,
  PSS10_SCALE_LABELS,
  PSS10_SCALE_MAX,
  PSS10_SCALE_MIN,
  type Pss10ItemKey,
} from "@/content/pss10";

type Answers = Partial<Record<Pss10ItemKey, number>>;

type DraftShape = {
  ident: IdentificationValues;
  answers: Answers;
};

type Props = {
  sessionId: string;
  participantId: string;
  polarId: string;
  studyGroup: StudyGroup | null;
  defaultDate: string;
  defaultStartTime: string;
};

export default function Pss10Form({
  sessionId,
  participantId,
  polarId,
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
        studyGroup: null,
        timepoint: "Baseline",
        language: "Português",
        filledBy: "participante" as FilledBy,
        formVersion: "v1.0",
      },
      answers: {},
    }),
    [polarId, defaultDate, defaultStartTime],
  );

  const { data, setData, clearDraft } = useDraft<DraftShape>(
    `pss10:${sessionId}`,
    initial,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<Set<Pss10ItemKey>>(new Set());
  const firstMissingRef = useRef<HTMLLIElement | null>(null);

  function setIdent(patch: Partial<IdentificationValues>) {
    setData((d) => ({ ...d, ident: { ...d.ident, ...patch } }));
  }
  function setAnswer(key: Pss10ItemKey, value: number) {
    setData((d) => ({ ...d, answers: { ...d.answers, [key]: value } }));
    setMissing((m) => {
      if (!m.has(key)) return m;
      const next = new Set(m);
      next.delete(key);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validação: os 10 itens são obrigatórios.
    const missingKeys = PSS10_ITEMS.filter(
      (item) => data.answers[item.key] === undefined,
    ).map((i) => i.key);

    if (missingKeys.length > 0) {
      setMissing(new Set(missingKeys));
      // Levar o foco (e a vista) à primeira questão em falta.
      requestAnimationFrame(() => {
        firstMissingRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstMissingRef.current?.focus();
      });
      setError(
        `Faltam ${missingKeys.length} resposta(s). Por favor responda a todas as questões.`,
      );
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const row = {
      session_id: sessionId,
      participant_id: participantId,
      polar_id: polarId,
      form_date: data.ident.formDate,
      start_time: data.ident.startTime,
      timepoint: data.ident.timepoint,
      language: data.ident.language,
      filled_by: data.ident.filledBy,
      q1: data.answers.q1,
      q2: data.answers.q2,
      q3: data.answers.q3,
      q4: data.answers.q4,
      q5: data.answers.q5,
      q6: data.answers.q6,
      q7: data.answers.q7,
      q8: data.answers.q8,
      q9: data.answers.q9,
      q10: data.answers.q10,
    };

    const { error: insertError } = await supabase
      .from("pss10_responses")
      .insert(row);

    if (insertError) {
      setSubmitting(false);
      setError(
        "Não foi possível guardar. Verifique a ligação e tente de novo — as suas respostas não se perderam.",
      );
      return;
    }

    clearDraft();
    router.replace(`/preencher/baseline?session=${sessionId}`);
  }

  const firstMissingKey = PSS10_ITEMS.find((i) => missing.has(i.key))?.key;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6">
        <ProgressBar current={1} total={2} label="PSS-10" />

        {/* Cabeçalho verbatim */}
        <header className="mb-6 text-center">
          <h1 className="text-[1.75rem] font-bold text-ink">
            {PSS10_HEADER.title}
          </h1>
          <p className="mt-1 text-[1.0625rem] italic text-muted">
            {PSS10_HEADER.subtitle}
          </p>
          <p className="text-[0.9375rem] text-muted">{PSS10_HEADER.authors}</p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <IdentificationBlock
            values={data.ident}
            onChange={setIdent}
            showGroup={false}
            showFormVersion={false}
            timepointLabel="Baseline"
          />

          {/* Instrução verbatim */}
          <p className="rounded-lg bg-surface-alt p-4 text-[1.0625rem] leading-relaxed text-ink">
            {PSS10_INSTRUCTION}
          </p>

          {/* Os 10 itens */}
          <ol className="space-y-6">
            {PSS10_ITEMS.map((item, idx) => {
              const isMissing = missing.has(item.key);
              const attachRef = item.key === firstMissingKey;
              return (
                <li
                  key={item.key}
                  ref={attachRef ? firstMissingRef : undefined}
                  tabIndex={attachRef ? -1 : undefined}
                  className="rounded-lg border border-line bg-surface p-4 shadow-card focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 sm:p-5"
                >
                  <ScaleRadio
                    name={`pss10-${item.key}`}
                    min={PSS10_SCALE_MIN}
                    max={PSS10_SCALE_MAX}
                    labels={PSS10_SCALE_LABELS}
                    value={data.answers[item.key] ?? null}
                    onChange={(v) => setAnswer(item.key, v)}
                    legend={`${idx + 1}. ${item.text}`}
                    required
                    error={isMissing}
                  />
                </li>
              );
            })}
          </ol>

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
            {submitting ? "A guardar…" : "Continuar para o formulário seguinte"}
          </button>

          {/* Rodapé de atribuição — obrigatório, verbatim */}
          <footer className="border-t border-line pt-4 text-[0.8125rem] leading-relaxed text-muted">
            {PSS10_ATTRIBUTION}
          </footer>
        </form>
      </main>
      <Footer />
    </div>
  );
}
