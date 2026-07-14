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
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2 text-[0.9375rem] font-semibold text-brand underline underline-offset-4 transition hover:bg-brand-tint hover:text-brand-hover disabled:opacity-50"
    >
      {loading ? "A sair…" : "Sair"}
    </button>
  );
}
