// src/lib/supabase/admin.ts
// Cliente Supabase com SERVICE ROLE — ignora o RLS, lê os dados de TODOS os participantes.
// SÓ PODE SER USADO NO SERVIDOR (route handlers / server components). Nunca no browser:
// a chave service_role dá acesso total. Não importar em componentes 'use client'.
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Configuração em falta: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (servidor).",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
