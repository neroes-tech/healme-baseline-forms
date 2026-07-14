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
    return { error: "Palavra-passe incorreta." };
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminCookie();
  redirect("/admin");
}
