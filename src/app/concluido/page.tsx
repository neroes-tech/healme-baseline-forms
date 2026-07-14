import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/Footer";

// /concluido — agradecimento + voltar ao dashboard. Sem pontuações.
export default async function ConcluidoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 text-center">
        <div className="rounded-xl border border-line bg-surface p-8 shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success-strong">
            ✓
          </div>
          <h1 className="text-[1.75rem] font-bold text-ink">Obrigado!</h1>
          <p className="mt-2 text-[1.0625rem] text-muted">
            As suas respostas foram guardadas com sucesso.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-13 items-center justify-center rounded-md bg-brand px-6 py-3.5 text-[1.0625rem] font-semibold text-brand-contrast shadow-sm transition hover:bg-brand-hover"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
