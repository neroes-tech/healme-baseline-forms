// src/middleware.ts
// Protege tudo exceto ficheiros estáticos. A lógica de auth vive em lib/supabase/middleware.
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Corresponde a todas as rotas exceto:
     * - _next/static, _next/image (assets)
     * - favicon.ico
     * - ficheiros de imagem
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
