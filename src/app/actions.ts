"use server";

// src/app/actions.ts
// Server Actions para criar sessões e inserir respostas (com RLS a garantir
// que participant_id = auth.uid()).
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Cria uma nova sessão de preenchimento e navega para o PSS-10.
export async function startSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("participants")
    .select("polar_id")
    .eq("id", user.id)
    .single();

  const { data: session, error } = await supabase
    .from("form_sessions")
    .insert({
      participant_id: user.id,
      polar_id: profile?.polar_id ?? "",
      timepoint: "Baseline",
      status: "in_progress",
    })
    .select("id")
    .single();

  if (error || !session) {
    throw new Error("Não foi possível iniciar o preenchimento. Tente de novo.");
  }

  redirect(`/preencher/pss10?session=${session.id}`);
}
