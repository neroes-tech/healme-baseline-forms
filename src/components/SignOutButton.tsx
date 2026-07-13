"use client";

// src/components/SignOutButton.tsx
// Botão discreto "Sair" no dashboard.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800 disabled:opacity-50"
    >
      {loading ? "A sair…" : "Sair"}
    </button>
  );
}
