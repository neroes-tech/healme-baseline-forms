import Footer from "@/components/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTimestamp } from "@/lib/datetime";
import { isAdminAuthed } from "@/lib/admin-auth";
import AdminLogin from "./AdminLogin";
import { logoutAdmin } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administração — HE26",
  robots: { index: false, follow: false },
};

type TrackRow = {
  polar_id: string;
  display_name: string | null;
  session_id: string;
  started_at: string;
  status: string;
  pss10_submitted_at: string | null;
  pss10_total: number | null;
  baseline_submitted_at: string | null;
};

export default async function AdminPage() {
  const authed = await isAdminAuthed();

  if (!authed) {
    return (
      <div className="flex min-h-dvh flex-col">
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
          <div className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
            <p className="text-[0.8125rem] font-semibold uppercase tracking-wide text-brand">
              HE26 · Administração
            </p>
            <h1 className="mt-1 text-[1.75rem] font-bold text-ink">
              Área reservada
            </h1>
            <p className="mt-1 text-[1.0625rem] text-muted">
              Acesso à exportação de dados do estudo.
            </p>
            <div className="mt-6">
              <AdminLogin />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from("v_tracking")
    .select(
      "polar_id, display_name, session_id, started_at, status, pss10_submitted_at, pss10_total, baseline_submitted_at",
    )
    .order("started_at", { ascending: false });

  const tracking = (rows ?? []) as TrackRow[];
  const nPss = tracking.filter((r) => r.pss10_submitted_at).length;
  const nBaseline = tracking.filter((r) => r.baseline_submitted_at).length;
  const nCompletas = tracking.filter(
    (r) => r.pss10_submitted_at && r.baseline_submitted_at,
  ).length;
  const participantes = new Set(tracking.map((r) => r.polar_id)).size;

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.8125rem] font-semibold uppercase tracking-wide text-brand">
              HE26 · Administração
            </p>
            <h1 className="mt-1 text-[1.75rem] font-bold text-ink sm:text-[2rem]">
              Exportação de dados
            </h1>
          </div>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2 text-[0.9375rem] font-semibold text-brand underline underline-offset-4 transition hover:bg-brand-tint hover:text-brand-hover"
            >
              Sair
            </button>
          </form>
        </header>

        {/* Cartões-resumo */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Participantes", value: participantes },
            { label: "PSS-10 submetidos", value: nPss },
            { label: "HEAL-ME submetidos", value: nBaseline },
            { label: "Sessões completas", value: nCompletas },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-line bg-surface p-4 shadow-sm"
            >
              <p className="text-[0.8125rem] font-medium text-muted">{s.label}</p>
              <p className="mt-1 text-[1.75rem] font-bold tabular-nums text-ink">
                {s.value}
              </p>
            </div>
          ))}
        </section>

        {/* Download */}
        <section className="mb-8 rounded-lg border border-line bg-surface p-5 shadow-card sm:p-6">
          <h2 className="text-[1.375rem] font-semibold text-ink">
            Descarregar Excel
          </h2>
          <p className="mt-1 text-[0.9375rem] text-muted">
            Um ficheiro <strong>.xlsx</strong> com duas folhas — <strong>PSS-10</strong> e{" "}
            <strong>HEAL-ME Baseline</strong> — com as respostas de todos os
            participantes, data/hora e todas as questões.
          </p>
          <a
            href="/admin/export"
            className="mt-4 inline-flex min-h-13 items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-[1.0625rem] font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover active:translate-y-px"
          >
            ⬇ Descarregar Excel
          </a>
        </section>

        {/* Resumo por sessão */}
        <section>
          <h2 className="mb-3 text-[1.375rem] font-semibold text-ink">
            Preenchimentos ({tracking.length})
          </h2>
          <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-sm">
            <table className="w-full min-w-[46rem] text-left text-[0.9375rem]">
              <thead className="border-b border-line bg-surface-alt text-[0.8125rem] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Iniciado</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">PSS-10</th>
                  <th className="px-4 py-3 font-semibold">HEAL-ME</th>
                  <th className="px-4 py-3 font-semibold">Total PSS-10</th>
                </tr>
              </thead>
              <tbody>
                {tracking.map((r) => (
                  <tr key={r.session_id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-semibold tabular-nums text-ink">
                      {r.polar_id}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">
                      {formatTimestamp(r.started_at)}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "completed" ? (
                        <span className="rounded-full bg-success-bg px-2.5 py-1 text-[0.8125rem] font-semibold text-success-strong">
                          Concluído
                        </span>
                      ) : (
                        <span className="rounded-full bg-warning-bg px-2.5 py-1 text-[0.8125rem] font-semibold text-[#92400E]">
                          Em curso
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">
                      {r.pss10_submitted_at ? formatTimestamp(r.pss10_submitted_at) : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted">
                      {r.baseline_submitted_at
                        ? formatTimestamp(r.baseline_submitted_at)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-ink">
                      {r.pss10_total ?? "—"}
                    </td>
                  </tr>
                ))}
                {tracking.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted">
                      Ainda não há preenchimentos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
