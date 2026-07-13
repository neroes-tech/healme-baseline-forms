import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nowTimeInStudyTz, todayInStudyTz } from "@/lib/datetime";
import type { StudyGroup } from "@/lib/types";
import BaselineForm from "./BaselineForm";

// /preencher/baseline — Formulário 2. Requer o PSS-10 da mesma sessão já submetido.
export default async function BaselinePage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionId } = await searchParams;
  if (!sessionId) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("form_sessions")
    .select("id, polar_id, started_at, status")
    .eq("id", sessionId)
    .single();
  if (!session) redirect("/");
  if (session.status !== "in_progress") redirect("/");

  // O PSS-10 tem de estar submetido antes do Baseline.
  const { data: pss } = await supabase
    .from("pss10_responses")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (!pss) redirect(`/preencher/pss10?session=${sessionId}`);

  // Se o Baseline já existir, a sessão está de facto concluída → agradecimento.
  const { data: existing } = await supabase
    .from("healme_baseline_responses")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (existing) redirect("/concluido");

  const { data: profile } = await supabase
    .from("participants")
    .select("polar_id, study_group")
    .eq("id", user.id)
    .single();

  return (
    <BaselineForm
      sessionId={session.id}
      participantId={user.id}
      polarId={profile?.polar_id ?? session.polar_id}
      studyGroup={(profile?.study_group as StudyGroup | null) ?? null}
      defaultDate={todayInStudyTz()}
      defaultStartTime={nowTimeInStudyTz(new Date(session.started_at))}
    />
  );
}
