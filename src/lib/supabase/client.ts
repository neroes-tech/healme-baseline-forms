// src/lib/supabase/client.ts
// Cliente Supabase para o browser (componentes 'use client').
// API atual do @supabase/ssr: createBrowserClient (sessão persistida em cookies).
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
