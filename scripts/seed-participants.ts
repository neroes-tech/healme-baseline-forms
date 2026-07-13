// scripts/seed-participants.ts
// Cria as contas polarNN@healme.pt com a service role key. Idempotente.
//   npm run seed
// Requer no .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//   SEED_PARTICIPANT_COUNT, SEED_PARTICIPANT_PASSWORD.
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const count = Number.parseInt(process.env.SEED_PARTICIPANT_COUNT ?? "0", 10);
const password = process.env.SEED_PARTICIPANT_PASSWORD;

function fail(msg: string): never {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!url) fail("Falta NEXT_PUBLIC_SUPABASE_URL no .env.local");
if (!serviceRoleKey) fail("Falta SUPABASE_SERVICE_ROLE_KEY no .env.local");
if (!password) fail("Falta SEED_PARTICIPANT_PASSWORD no .env.local");
if (!count || count < 1) fail("SEED_PARTICIPANT_COUNT tem de ser >= 1");

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Já existe uma conta com este email? (idempotência)
async function emailExists(email: string): Promise<boolean> {
  // A API de admin pagina; procuramos o email nas páginas.
  let page = 1;
  const perPage = 1000;
  // Loop até a página vir vazia.
  // (Para dezenas/centenas de participantes, 1 página basta.)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) fail(`Erro a listar utilizadores: ${error.message}`);
    if (data.users.some((u) => u.email?.toLowerCase() === email)) return true;
    if (data.users.length < perPage) return false;
    page += 1;
  }
}

async function main() {
  console.log(`\nA semear ${count} participante(s) em ${url}\n`);
  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= count; i++) {
    const nn = String(i).padStart(2, "0");
    const email = `polar${nn}@healme.pt`;
    const polarId = `H${nn}`;
    const displayName = `polar h${nn}`;

    if (await emailExists(email)) {
      console.log(`• ${email} — já existe, salta`);
      skipped += 1;
      continue;
    }

    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { polar_id: polarId, display_name: displayName },
    });

    if (error) {
      // Corrida / já registado: trata como skip, não como falha.
      if (/already been registered|already registered/i.test(error.message)) {
        console.log(`• ${email} — já registado, salta`);
        skipped += 1;
        continue;
      }
      fail(`Erro a criar ${email}: ${error.message}`);
    }

    console.log(`✓ ${email}  (${polarId} · ${displayName})`);
    created += 1;
  }

  console.log(`\nConcluído: ${created} criado(s), ${skipped} saltado(s).\n`);
}

main().catch((e) => fail(String(e)));
