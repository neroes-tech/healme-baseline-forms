"use server";

// src/app/admin/actions.ts
import { redirect } from "next/navigation";
import {
  checkPassword,
  clearAdminCookie,
  setAdminCookie,
} from "@/lib/admin-auth";

export type LoginState = { error: string | null };

export async function loginAdmin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    // Atraso anti-força-bruta (defesa em profundidade; a password deve na mesma ser forte).
    await new Promise((r) => setTimeout(r, 700));
    return { error: "Palavra-passe incorreta." };
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminCookie();
  redirect("/admin");
}
