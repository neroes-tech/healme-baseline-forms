// src/lib/admin-auth.ts
// Gate simples de administrador por palavra-passe (partilhada) para a área /admin.
// A password vem de ADMIN_PASSWORD (servidor). O cookie de sessão guarda um token
// NÃO forjável: HMAC(service_role_key, "he26-admin:" + password). Como o atacante não
// conhece a service_role_key, não consegue fabricar o cookie. Trocar a password
// invalida automaticamente os cookies antigos.
import "server-only";
import { createHmac } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "he26_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

export function getAdminPassword(): string {
  // Default "polar" (pedido da equipa) — trocável via ADMIN_PASSWORD. Recomenda-se
  // definir uma password forte em produção.
  return process.env.ADMIN_PASSWORD || "polar";
}

function adminToken(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY em falta (servidor).");
  return createHmac("sha256", secret)
    .update("he26-admin:" + getAdminPassword())
    .digest("hex");
}

// Timing-safe-ish comparação (comprimentos iguais → hex de 64 chars).
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkPassword(input: string): boolean {
  return safeEqual(input, getAdminPassword());
}

export async function setAdminCookie() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete({ name: ADMIN_COOKIE, path: "/admin" });
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  try {
    return safeEqual(value, adminToken());
  } catch {
    return false;
  }
}
