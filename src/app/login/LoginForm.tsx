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

const inputClass =
  "min-h-13 w-full rounded-sm border border-control bg-surface px-3.5 py-3 text-[1.0625rem] text-ink placeholder:text-placeholder focus-visible:border-brand";

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
          className="mb-1.5 block text-[0.8125rem] font-semibold text-muted"
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
          aria-invalid={!!error}
          aria-describedby={error ? "login-error" : undefined}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[0.8125rem] font-semibold text-muted"
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
          aria-invalid={!!error}
          aria-describedby={error ? "login-error" : undefined}
          className={inputClass}
        />
      </div>

      {error && (
        <p
          id="login-error"
          role="alert"
          className="flex items-start gap-1.5 rounded-md border-l-4 border-error bg-error-bg p-3 text-[0.9375rem] font-medium text-error"
        >
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-[1.0625rem] font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0"
      >
        {loading ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
