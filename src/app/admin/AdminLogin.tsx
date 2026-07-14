"use client";

// src/app/admin/AdminLogin.tsx
import { useActionState } from "react";
import { loginAdmin, type LoginState } from "./actions";

const initial: LoginState = { error: null };

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(loginAdmin, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="admin-password"
          className="mb-1.5 block text-[0.8125rem] font-semibold text-muted"
        >
          Palavra-passe de administrador
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "admin-error" : undefined}
          className="min-h-13 w-full rounded-sm border border-control bg-surface px-3.5 py-3 text-[1.0625rem] text-ink focus-visible:border-brand"
        />
      </div>

      {state.error && (
        <p
          id="admin-error"
          role="alert"
          className="flex items-start gap-1.5 rounded-md border-l-4 border-error bg-error-bg p-3 text-[0.9375rem] font-medium text-error"
        >
          <span aria-hidden="true">⚠</span> {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-13 w-full items-center justify-center rounded-md bg-brand px-6 py-3.5 text-[1.0625rem] font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
