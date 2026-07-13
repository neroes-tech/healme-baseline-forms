# healme-baseline — HEAL-ME-EGYPT-2026 (HE26)

App de recolha dos dois formulários baseline do estudo **HEAL-ME-EGYPT-2026**:
o **PSS-10** (escala validada) seguido do **HEAL-ME Baseline Mínimo**.
Cada participante é identificado **apenas** pelo número da banda Polar — nunca por nome.

- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + RLS)
- **Sessão** persistida em cookies via `@supabase/ssr`.
- **Regra de Ouro:** o texto dos questionários é **verbatim** dos PDFs em `docs/fontes/`.
  A única fonte do texto vive em [`src/content/`](src/content/). Nunca hardcodar strings de
  questionário em componentes.

---

## Pré-requisitos (WSL / Ubuntu)

- **Node 20+** (`node --version`)
- **npm**
- **Supabase CLI** — <https://supabase.com/docs/guides/cli>
  ```bash
  # via npm (mais simples em WSL)
  npm install -g supabase
  supabase --version
  ```

---

## 1. Criar o projeto Supabase (cloud)

Usamos um **projeto cloud** (evita a dependência do Docker em WSL).

1. Cria um projeto em <https://supabase.com/dashboard>.
2. Vai a **Project Settings → API** e copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - a chave **anon / publishable** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - a chave **service_role / secret** → `SUPABASE_SERVICE_ROLE_KEY` (**só local/scripts**)
3. **Desativa o sign-up público:** **Authentication → Providers → Email** → desliga
   *"Allow new users to sign up"*. As contas são criadas pelo script de seed.

## 2. Aplicar as migrações

```bash
# liga o repo ao projeto cloud (pede a database password)
supabase link --project-ref <PROJECT_REF>

# aplica supabase/migrations/0001_init.sql
supabase db push
```

Isto cria as tabelas, os enums, o trigger `handle_new_user`, as políticas RLS e a
vista `v_tracking`.

## 3. Variáveis de ambiente

```bash
cp .env.example .env.local
# edita .env.local com os valores do passo 1
```

`.env.local` está no `.gitignore`. **Nunca** commitar a service role key nem a password.

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave pública (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | **só** scripts locais (seed) |
| `NEXT_PUBLIC_STUDY_TIMEZONE` | fuso para mostrar/pré-preencher Data/Hora (`Europe/Lisbon` → trocar para `Africa/Cairo`) |
| `SEED_PARTICIPANT_COUNT` | nº de contas a criar |
| `SEED_PARTICIPANT_PASSWORD` | password partilhada dos participantes |

## 4. Instalar e semear as contas

```bash
npm install
npm run seed        # cria polar01@healme.pt … polarNN@healme.pt (idempotente)
```

Cada conta: email `polarNN@healme.pt`, `polar_id` `HNN`, `display_name` `polar hNN`,
password = `SEED_PARTICIPANT_PASSWORD` (igual para todos).

## 5. Correr

```bash
npm run dev         # http://localhost:3000
```

Login com o **número da banda** (`01`, `02`, …) + password. A app constrói o email
`polarNN@healme.pt` por trás; também aceita o email completo.

```bash
npm run build       # verificar produção
```

---

## Configuração de sessão no dashboard (sem timeout) — importante

Para que a pessoa faça sign-in **uma vez** e continue autenticada durante dias/semanas:

- **Authentication → Sessions**:
  - **Inactivity timeout:** desligado / vazio (sem timeout de inatividade).
  - **Time-box user sessions:** desligado / vazio (sem time-box de sessão).

A sessão vive em cookies (`@supabase/ssr`) e o `middleware.ts` refresca o token em cada
request. Há um botão discreto **"Sair"** no dashboard para terminar a sessão manualmente.

---

## Fluxo

```
/login → / (dashboard) → /preencher/pss10 → /preencher/baseline → /concluido
```

- **Iniciar** cria uma linha em `form_sessions` (`in_progress`).
- O PSS-10 insere em `pss10_responses`; o Baseline insere em `healme_baseline_responses`
  e marca a sessão `completed`. Os três partilham o mesmo `session_id`.
- Cada preenchimento é uma **linha nova** — nada é sobrescrito (dados imutáveis via RLS).
- Rascunhos guardados em `localStorage` por `session_id`; retoma-se onde se ficou.
- **Nunca** são mostradas pontuações ao participante.

---

## Proofreading do conteúdo

```bash
npm run print-content
```

Imprime todo o texto dos dois formulários. **Compara linha a linha com os PDFs em
`docs/fontes/`** e confirma que está idêntico (Regra de Ouro).

---

## Como exportar os dados

No **Supabase Studio** (Table Editor / SQL Editor), com a service role:

1. **`v_tracking`** — uma linha por momento de preenchimento e por participante, com os
   timestamps do PSS-10 e do Baseline e o `pss10_total`. Ideal para acompanhamento.
2. **`pss10_responses`** e **`healme_baseline_responses`** — os dados completos.

Para CSV: abre a tabela/vista no Table Editor → **Export → CSV**, ou corre um `select`
no SQL Editor e usa **Download CSV**.

A chave que liga `polar_id` ↔ pessoa vive **fora** do sistema (documento offline da equipa).

---

## Modelo de dados (resumo)

- `participants` — perfil 1:1 com `auth.users` (criado pelo trigger `handle_new_user`).
- `form_sessions` — liga PSS-10 + Baseline do mesmo momento.
- `pss10_responses` — 10 itens (0–4). `total_score` é uma **coluna gerada** (itens 4/5/7/8
  invertidos, total 0–40) e **nunca é mostrada** ao participante.
- `healme_baseline_responses` — todos os campos **nullable** (pode deixar em branco).
- RLS: cada participante só lê/escreve os seus dados. Sem `update`/`delete` nas respostas
  → **imutáveis**. Investigadores leem tudo via service role.
