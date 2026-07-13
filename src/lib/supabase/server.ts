// src/lib/supabase/server.ts
// Cliente Supabase para Server Components / Route Handlers / Server Actions.
// API atual do @supabase/ssr: createServerClient com getAll/setAll sobre os cookies do Next.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // O método setAll foi chamado a partir de um Server Component.
            // Pode ser ignorado se houver middleware a refrescar a sessão.
          }
        },
      },
    },
  );
}
