// src/app/admin/export/route.ts
// GET /admin/export → gera um .xlsx com 2 folhas (PSS-10 e HEAL-ME Baseline)
// com as respostas de TODOS os participantes. Protegido pelo gate de admin.
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAuthed } from "@/lib/admin-auth";
import { STUDY_TIMEZONE } from "@/lib/datetime";
import { PSS10_ITEMS } from "@/content/pss10";
import {
  SECAO_BEM_ESTAR,
  SECAO_CONEXAO,
  SECAO_ENRAIZAMENTO,
  SECAO_SIGNIFICADO,
  SECAO_SONO,
  type ScaleItem,
} from "@/content/healme-baseline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Col = Partial<ExcelJS.Column> & { header: string; key: string; width: number };

function fmtTs(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: STUDY_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function todayStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function styleHeader(ws: ExcelJS.Worksheet) {
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F766E" }, // teal Neroes
  };
  header.alignment = { vertical: "middle", wrapText: true };
  header.height = 44;
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: ws.columnCount },
  };
}

// Cada item de escala 0–10 → 2 colunas: valor + notas.
function scalePairs(itens: readonly ScaleItem[]): Col[] {
  return itens.flatMap((it) => [
    { header: it.text, key: it.key, width: 12 },
    { header: `${it.text} — Notas`, key: it.notasKey, width: 26 },
  ]);
}

export async function GET(request: Request) {
  if (!(await isAdminAuthed())) {
    return Response.redirect(new URL("/admin", request.url), 303);
  }

  const supabase = createAdminClient();

  const [{ data: pss }, { data: baseline }] = await Promise.all([
    supabase
      .from("pss10_responses")
      .select("*")
      .order("polar_id", { ascending: true })
      .order("submitted_at", { ascending: true }),
    supabase
      .from("healme_baseline_responses")
      .select("*")
      .order("polar_id", { ascending: true })
      .order("submitted_at", { ascending: true }),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "HEAL-ME-EGYPT-2026";
  wb.created = new Date();

  // ---------- Folha 1: PSS-10 ----------
  const pssCols: Col[] = [
    { header: "ID (banda)", key: "polar_id", width: 12 },
    { header: "Data", key: "form_date", width: 12 },
    { header: "Hora início", key: "start_time", width: 12 },
    { header: "Submetido em", key: "submitted_at", width: 18 },
    ...PSS10_ITEMS.map((it, i) => ({
      header: `${i + 1}. ${it.text}`,
      key: it.key,
      width: 16,
    })),
    { header: "Total PSS-10 (0–40)", key: "total_score", width: 14 },
  ];
  const ws1 = wb.addWorksheet("PSS-10", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
  });
  ws1.columns = pssCols;
  ws1.addRows((pss ?? []).map((r) => ({ ...r, submitted_at: fmtTs(r.submitted_at) })));
  styleHeader(ws1);

  // ---------- Folha 2: HEAL-ME Baseline ----------
  const hmCols: Col[] = [
    { header: "ID (banda)", key: "polar_id", width: 12 },
    { header: "Data", key: "form_date", width: 12 },
    { header: "Hora início", key: "start_time", width: 12 },
    { header: "Submetido em", key: "submitted_at", width: 18 },
    ...scalePairs(SECAO_BEM_ESTAR.itens),
    { header: SECAO_SONO.perguntas.horaDeitar, key: "sono_hora_deitar", width: 14 },
    { header: SECAO_SONO.perguntas.horaAcordar, key: "sono_hora_acordar", width: 14 },
    { header: "Horas dormidas", key: "sono_horas", width: 12 },
    { header: "Minutos dormidos", key: "sono_minutos", width: 12 },
    { header: "Duração do sono (min)", key: "sono_duracao_min", width: 14 },
    { header: SECAO_SONO.perguntas.qualidade, key: "sono_qualidade", width: 14 },
    { header: SECAO_SONO.perguntas.fadiga, key: "fadiga_agora", width: 14 },
    { header: SECAO_SONO.perguntas.sintomas, key: "sintomas_fisicos", width: 14 },
    { header: "Sintomas — descrição", key: "sintomas_fisicos_desc", width: 26 },
    ...scalePairs(SECAO_SIGNIFICADO.itens),
    ...scalePairs(SECAO_CONEXAO.itens),
    ...scalePairs(SECAO_ENRAIZAMENTO.itens),
    { header: "Concluído em", key: "concluido_em", width: 18 },
  ];
  const ws2 = wb.addWorksheet("HEAL-ME Baseline", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
  });
  ws2.columns = hmCols;
  ws2.addRows(
    (baseline ?? []).map((r) => ({
      ...r,
      submitted_at: fmtTs(r.submitted_at),
      concluido_em: fmtTs(r.concluido_em),
      sintomas_fisicos:
        r.sintomas_fisicos === null ? "" : r.sintomas_fisicos ? "Sim" : "Não",
    })),
  );
  styleHeader(ws2);

  const body = Buffer.from(await wb.xlsx.writeBuffer());

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="HE26_respostas_${todayStr()}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
