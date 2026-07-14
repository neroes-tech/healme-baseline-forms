import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";

// /login — campo principal "Número da banda Polar" + password.
export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <p className="text-[0.8125rem] font-semibold uppercase tracking-wide text-brand">
            HE26
          </p>
          <h1 className="mt-1 text-[1.75rem] font-bold text-ink">
            HEAL-ME-EGYPT-2026
          </h1>
          <p className="mt-1 text-[1.0625rem] text-muted">
            Entre com o número da sua banda Polar.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
