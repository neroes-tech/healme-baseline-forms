import LoginForm from "./LoginForm";

// /login — campo principal "Número da banda Polar" + password.
export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-slate-900">HEAL-ME-EGYPT-2026</h1>
        <p className="mt-1 text-sm text-slate-600">
          Entre com o número da sua banda Polar.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
