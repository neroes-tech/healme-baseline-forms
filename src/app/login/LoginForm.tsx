"use client";

// src/app/login/LoginForm.tsx
// Campo principal: número da banda Polar (01, 02, …). Constrói o email polarNN@healme.pt.
// Aceita também o email completo como fallback.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function resolveEmail(input: string): string {
  const trimmed = input.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase(); // fallback: email completo
  // Só dígitos → normaliza para 2 casas: "1" → "01", "01" → "01".
  const digits = trimmed.replace(/\D/g, "");
  const padded = digits.padStart(2, "0");
  return `polar${padded}@healme.pt`;
}

export default function LoginForm() {
  const router = useRouter();
  const [band, setBand] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const email = resolveEmail(band);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Número da banda ou palavra-passe incorretos.");
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="band"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Número da banda Polar
        </label>
        <input
          id="band"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          placeholder="ex.: 01"
          value={band}
          onChange={(e) => setBand(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-lg text-slate-900"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-lg text-slate-900"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
