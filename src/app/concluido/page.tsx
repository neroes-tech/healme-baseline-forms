import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// /concluido — agradecimento + voltar ao dashboard. Sem pontuações.
export default async function ConcluidoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10 text-center">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Obrigado!</h1>
        <p className="mt-2 text-slate-600">
          As suas respostas foram guardadas com sucesso.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
