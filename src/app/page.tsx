import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatTimestamp } from "@/lib/datetime";
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

  // Que sessões já têm PSS-10 submetido (para saber onde retomar).
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
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Olá, {profile?.display_name || "participante"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            ID do participante: {profile?.polar_id}
          </p>
        </div>
        <SignOutButton />
      </header>

      {/* Sessão em curso — retomar */}
      {inProgress ? (
        <section className="mb-6 rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Tem um preenchimento por concluir
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Iniciado em {formatTimestamp(inProgress.started_at)}.
          </p>
          <Link
            href={resumeHref(inProgress.id)}
            className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
          >
            Retomar preenchimento
          </Link>
        </section>
      ) : (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Novo preenchimento
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Vai preencher dois formulários em sequência.
          </p>
          <form action={startSession} className="mt-4">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
            >
              Iniciar novo preenchimento
            </button>
          </form>
        </section>
      )}

      {/* Histórico */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Preenchimentos anteriores
        </h2>
        {sessions && sessions.length > 0 ? (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {formatTimestamp(s.started_at)}
                  </p>
                  <p className="text-sm text-slate-500">{s.timepoint}</p>
                </div>
                {s.status === "completed" ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    Concluído
                  </span>
                ) : (
                  <Link
                    href={resumeHref(s.id)}
                    className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 underline underline-offset-2"
                  >
                    Em curso — retomar
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Ainda não há preenchimentos.</p>
        )}
      </section>
    </main>
  );
}
