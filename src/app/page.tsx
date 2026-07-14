import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatTimestamp } from "@/lib/datetime";
import Footer from "@/components/Footer";
import SignOutButton from "@/components/SignOutButton";
import { startSession } from "./actions";

// / — dashboard protegido. "Olá, polar h01" + iniciar + histórico.
// NUNCA mostrar pontuações.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("participants")
    .select("polar_id, display_name")
    .eq("id", user.id)
    .single();

  const { data: sessions } = await supabase
    .from("form_sessions")
    .select("id, timepoint, started_at, completed_at, status")
    .order("started_at", { ascending: false });

  const { data: pssRows } = await supabase
    .from("pss10_responses")
    .select("session_id");
  const pssDone = new Set((pssRows ?? []).map((r) => r.session_id));

  const inProgress = (sessions ?? []).find((s) => s.status === "in_progress");

  function resumeHref(sessionId: string): string {
    return pssDone.has(sessionId)
      ? `/preencher/baseline?session=${sessionId}`
      : `/preencher/pss10?session=${sessionId}`;
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-content flex-1 px-4 py-8 sm:px-6">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.8125rem] font-semibold uppercase tracking-wide text-brand">
              HE26
            </p>
            <h1 className="mt-1 text-[1.75rem] font-bold text-ink sm:text-[2rem]">
              Olá, {profile?.display_name || "participante"}
            </h1>
            <p className="mt-1 text-[0.9375rem] text-muted">
              ID do participante: {profile?.polar_id}
            </p>
          </div>
          <SignOutButton />
        </header>

        {/* Sessão em curso — retomar */}
        {inProgress ? (
          <section className="mb-6 rounded-lg border-l-4 border-[#B45309] bg-warning-bg p-5">
            <h2 className="text-[1.375rem] font-semibold text-ink">
              Tem um preenchimento por concluir
            </h2>
            <p className="mt-1 text-[0.9375rem] text-[#92400E]">
              Iniciado em {formatTimestamp(inProgress.started_at)}.
            </p>
            <Link
              href={resumeHref(inProgress.id)}
              className="mt-4 inline-flex min-h-13 items-center justify-center rounded-md bg-brand px-6 py-3.5 text-[1.0625rem] font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover"
            >
              Retomar preenchimento
            </Link>
          </section>
        ) : (
          <section className="mb-6 rounded-lg border border-line bg-surface p-5 shadow-card sm:p-6">
            <h2 className="text-[1.375rem] font-semibold text-ink">
              Novo preenchimento
            </h2>
            <p className="mt-1 text-[0.9375rem] text-muted">
              Vai preencher dois formulários em sequência.
            </p>
            <form action={startSession} className="mt-4">
              <button
                type="submit"
                className="inline-flex min-h-13 items-center justify-center rounded-md bg-brand px-6 py-3.5 text-[1.0625rem] font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover active:translate-y-px"
              >
                Iniciar novo preenchimento
              </button>
            </form>
          </section>
        )}

        {/* Histórico */}
        <section>
          <h2 className="mb-3 text-[1.375rem] font-semibold text-ink">
            Preenchimentos anteriores
          </h2>
          {sessions && sessions.length > 0 ? (
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {formatTimestamp(s.started_at)}
                    </p>
                    <p className="text-[0.8125rem] text-muted">{s.timepoint}</p>
                  </div>
                  {s.status === "completed" ? (
                    <span className="rounded-full bg-success-bg px-3 py-1 text-[0.8125rem] font-semibold text-success-strong">
                      Concluído
                    </span>
                  ) : (
                    <Link
                      href={resumeHref(s.id)}
                      className="rounded-full bg-warning-bg px-3 py-1 text-[0.8125rem] font-semibold text-[#92400E] underline underline-offset-2"
                    >
                      Em curso — retomar
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.9375rem] text-muted">
              Ainda não há preenchimentos.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
