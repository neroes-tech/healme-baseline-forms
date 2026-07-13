import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { nowTimeInStudyTz, todayInStudyTz } from "@/lib/datetime";
import type { StudyGroup } from "@/lib/types";
import Pss10Form from "./Pss10Form";

// /preencher/pss10 — Formulário 1. Requer uma sessão válida em curso.
export default async function Pss10Page({
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

  // RLS garante que só devolve a sessão se for do próprio participante.
  const { data: session } = await supabase
    .from("form_sessions")
    .select("id, polar_id, started_at, status")
    .eq("id", sessionId)
    .single();
  if (!session) redirect("/");
  if (session.status !== "in_progress") redirect("/");

  // Se o PSS-10 desta sessão já foi submetido, avança para o formulário seguinte.
  const { data: existing } = await supabase
    .from("pss10_responses")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (existing) redirect(`/preencher/baseline?session=${sessionId}`);

  const { data: profile } = await supabase
    .from("participants")
    .select("polar_id, study_group")
    .eq("id", user.id)
    .single();

  const startTime = nowTimeInStudyTz(new Date(session.started_at));

  return (
    <Pss10Form
      sessionId={session.id}
      participantId={user.id}
      polarId={profile?.polar_id ?? session.polar_id}
      studyGroup={(profile?.study_group as StudyGroup | null) ?? null}
      defaultDate={todayInStudyTz()}
      defaultStartTime={startTime}
    />
  );
}
