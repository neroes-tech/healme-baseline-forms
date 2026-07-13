# Prompt para o Claude Code — projeto `healme-baseline`

> **Como usar:** copia este ficheiro para a raiz do projeto (ex.: `docs/SPEC.md`), abre o Claude Code na pasta e diz:
> *"Lê o `docs/SPEC.md` e implementa o projeto do zero. Segue a Regra de Ouro à risca. Para no fim de cada fase e mostra-me o que fizeste."*

---

## 0. Contexto

Estudo **HEAL-ME-EGYPT-2026 (HE26)**. Participantes preenchem **dois questionários em sequência**, **várias vezes ao longo do tempo**. Cada participante é identificado apenas pelo **número da banda Polar** — nunca por nome.

O repositório está **vazio**. Constrói tudo de raiz.

Os PDFs originais estão em `docs/fontes/`:
- `pss10_portuguese_scale_only.pdf`
- `HE26_Formulario_Baseline_Participante_PT_v1.pdf`

**Lê os dois PDFs antes de escrever qualquer código** e confirma que cada string que escreves bate certo, caracter a caracter, com o original.

---

## 1. REGRA DE OURO (não negociável)

> **O conteúdo dos questionários tem de ficar exatamente igual ao original: mesmo texto, mesma ordem, mesmas escalas, mesmas opções.**
> Não reescrever, não "melhorar", não corrigir, não traduzir, não abreviar, não reordenar. O PSS-10 é uma **escala validada** — qualquer alteração de texto invalida os dados.

**Única alteração permitida (bloco de identificação):**
- **Sem campo "Nome"** em nenhum dos dois formulários. Remover o "Nome" do cabeçalho do PSS-10.
- O **número da banda Polar** é o **único identificador**, e vem automaticamente da conta com que a pessoa fez sign-in (campo `ID do participante` preenchido e **read-only**).
- Manter os restantes campos de identificação: **Data, Hora de início, Timepoint (Baseline), Língua, Preenchido por (Participante / Operador)**, mais **Grupo** e **Versão do formulário** (existem no original do HEAL-ME, portanto ficam).

**Onde tiveres dúvida sobre uma string, mantém o original e deixa um comentário `// REVER COM A EQUIPA:` — nunca decidas sozinho alterar texto.**

---

## 2. Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS** (`src/` dir, import alias `@/*`)
- **Supabase**: Postgres + Auth (email/password) + RLS
- **`@supabase/ssr`** para sessão em cookies (persistência do sign-in)
- Node 20+. Gestor de pacotes: `npm`
- Ambiente: **WSL (Ubuntu)**

> ⚠️ **Confirma a API atual do `@supabase/ssr` e do `@supabase/supabase-js` na documentação oficial antes de escreveres o código de auth** (o padrão `createBrowserClient` / `createServerClient` / middleware mudou ao longo do tempo, e a nomenclatura das chaves pode ser `anon`/`service_role` ou `publishable`/`secret`). Não escrevas de memória.

Supabase: usar um **projeto cloud** (evita a dependência do Docker em WSL), mas manter as migrações versionadas em `supabase/migrations/` e aplicar com a Supabase CLI (`supabase link` + `supabase db push`).

---

## 3. Estrutura do repositório

```
healme-baseline/
├── docs/
│   ├── SPEC.md                       # este ficheiro
│   └── fontes/                       # PDFs originais (fonte de verdade)
├── supabase/
│   └── migrations/
│       └── 0001_init.sql
├── scripts/
│   ├── seed-participants.ts          # cria as contas polarNN@healme.pt
│   └── print-content.ts              # imprime todo o texto dos formulários para proofreading
├── src/
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── page.tsx                  # dashboard (protegido)
│   │   ├── preencher/
│   │   │   ├── pss10/page.tsx
│   │   │   └── baseline/page.tsx
│   │   ├── concluido/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── IdentificationBlock.tsx
│   │   ├── ScaleRadio.tsx            # escala 0–4 e 0–10, reutilizável
│   │   └── ...
│   ├── content/
│   │   ├── pss10.ts                  # ÚNICA fonte do texto do PSS-10
│   │   └── healme-baseline.ts        # ÚNICA fonte do texto do HEAL-ME
│   ├── lib/supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── middleware.ts
├── .env.example
├── .env.local                        # NUNCA commitar
└── README.md
```

**Todo o texto dos formulários vive em `src/content/*.ts` como constantes tipadas.** Nenhuma string de questionário hardcoded em componentes. Isto garante que o texto não "deriva" e permite fazer proofreading num só sítio.

---

## 4. Modelo de dados (Supabase)

Uma tabela **por formulário**, como pedido, mais uma tabela de **sessão** que liga os dois preenchimentos do mesmo momento — é isto que permite fazer *tracking por participante e por timestamp*.

```sql
-- supabase/migrations/0001_init.sql
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
create type public.study_group as enum ('active', 'vacation', 'waitlist');
create type public.filled_by   as enum ('participante', 'operador');

-- ---------- Participantes (perfil, 1:1 com auth.users) ----------
create table public.participants (
  id                uuid primary key references auth.users(id) on delete cascade,
  polar_id          text not null unique,        -- 'H01', 'H02', ...
  display_name      text not null,               -- 'polar h01'
  email             text not null unique,        -- 'polar01@healme.pt'
  polar_band_serial text,                        -- opcional: nº de série físico da banda
  study_group       public.study_group,          -- opcional: pré-preenche o campo "Grupo"
  created_at        timestamptz not null default now()
);

-- ---------- Sessão de preenchimento (liga PSS-10 + Baseline do mesmo momento) ----------
create table public.form_sessions (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  polar_id       text not null,
  timepoint      text not null default 'Baseline',
  started_at     timestamptz not null default now(),
  completed_at   timestamptz,
  status         text not null default 'in_progress'
                   check (status in ('in_progress', 'completed'))
);
create index on public.form_sessions (participant_id, started_at desc);

-- ---------- Formulário 1: PSS-10 ----------
create table public.pss10_responses (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null unique references public.form_sessions(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  polar_id       text not null,

  -- identificação
  form_date  date not null,
  start_time time not null,
  timepoint  text not null default 'Baseline',
  language   text not null default 'Português',
  filled_by  public.filled_by not null,

  -- itens 1..10 (0–4)
  q1  smallint not null check (q1  between 0 and 4),
  q2  smallint not null check (q2  between 0 and 4),
  q3  smallint not null check (q3  between 0 and 4),
  q4  smallint not null check (q4  between 0 and 4),
  q5  smallint not null check (q5  between 0 and 4),
  q6  smallint not null check (q6  between 0 and 4),
  q7  smallint not null check (q7  between 0 and 4),
  q8  smallint not null check (q8  between 0 and 4),
  q9  smallint not null check (q9  between 0 and 4),
  q10 smallint not null check (q10 between 0 and 4),

  -- pontuação PSS-10: itens 4, 5, 7 e 8 são INVERTIDOS (4 - valor). Total 0–40.
  -- NUNCA mostrada ao participante.
  total_score smallint generated always as (
    q1 + q2 + q3 + (4 - q4) + (4 - q5) + q6 + (4 - q7) + (4 - q8) + q9 + q10
  ) stored,

  submitted_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index on public.pss10_responses (participant_id, submitted_at desc);

-- ---------- Formulário 2: HEAL-ME Baseline Mínimo ----------
create table public.healme_baseline_responses (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null unique references public.form_sessions(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  polar_id       text not null,

  -- identificação
  form_date    date not null,
  start_time   time not null,
  study_group  public.study_group,
  timepoint    text not null default 'Baseline',
  language     text not null default 'Português',
  filled_by    public.filled_by not null,
  form_version text not null default 'v1.0',

  -- 1. Bem-estar / wellbeing (0–10 + notas)
  wb_geral                  smallint check (wb_geral between 0 and 10),
  wb_geral_notas            text,
  wb_lidar_exigencias       smallint check (wb_lidar_exigencias between 0 and 10),
  wb_lidar_exigencias_notas text,
  wb_satisfacao_vida        smallint check (wb_satisfacao_vida between 0 and 10),
  wb_satisfacao_vida_notas  text,

  -- 2. Sono / sleep
  sono_hora_deitar      time,
  sono_hora_acordar     time,
  sono_horas            smallint check (sono_horas between 0 and 24),
  sono_minutos          smallint check (sono_minutos between 0 and 59),
  sono_duracao_min      integer generated always as (
    case when sono_horas is null and sono_minutos is null then null
         else coalesce(sono_horas, 0) * 60 + coalesce(sono_minutos, 0) end
  ) stored,
  sono_qualidade        smallint check (sono_qualidade between 0 and 10),
  fadiga_agora          smallint check (fadiga_agora between 0 and 10),
  sintomas_fisicos      boolean,
  sintomas_fisicos_desc text,

  -- 3. Significado / meaning
  sig_proposito            smallint check (sig_proposito between 0 and 10),
  sig_proposito_notas      text,
  sig_clareza              smallint check (sig_clareza between 0 and 10),
  sig_clareza_notas        text,
  sig_ligacao_maior        smallint check (sig_ligacao_maior between 0 and 10),
  sig_ligacao_maior_notas  text,

  -- 4. Conexão / connection
  con_conectado             smallint check (con_conectado between 0 and 10),
  con_conectado_notas       text,
  con_apoiado               smallint check (con_apoiado between 0 and 10),
  con_apoiado_notas         text,
  con_seguranca_grupo       smallint check (con_seguranca_grupo between 0 and 10),
  con_seguranca_grupo_notas text,

  -- 5. Enraizamento / groundedness
  enr_estavel                smallint check (enr_estavel between 0 and 10),
  enr_estavel_notas          text,
  enr_presente_corpo         smallint check (enr_presente_corpo between 0 and 10),
  enr_presente_corpo_notas   text,
  enr_voltar_calma           smallint check (enr_voltar_calma between 0 and 10),
  enr_voltar_calma_notas     text,

  -- Confirmação final
  confirmacao_iniciais text,
  concluido_em         timestamptz,

  submitted_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index on public.healme_baseline_responses (participant_id, submitted_at desc);
```

**Nota importante:** no HEAL-ME **todos os campos de resposta são `nullable`** — o formulário diz explicitamente *"Pode deixar uma pergunta em branco se não quiser responder."* No PSS-10 os 10 itens são obrigatórios (sem os 10, o score não é válido).

### Trigger: criar o perfil a partir da conta de auth

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.participants (id, email, polar_id, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'polar_id', ''),
    coalesce(new.raw_user_meta_data->>'display_name', '')
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### RLS (dados imutáveis)

```sql
alter table public.participants               enable row level security;
alter table public.form_sessions              enable row level security;
alter table public.pss10_responses            enable row level security;
alter table public.healme_baseline_responses  enable row level security;

create policy "own profile: select"    on public.participants  for select using (id = auth.uid());

create policy "own sessions: select"   on public.form_sessions for select using (participant_id = auth.uid());
create policy "own sessions: insert"   on public.form_sessions for insert with check (participant_id = auth.uid());
create policy "own sessions: update"   on public.form_sessions for update using (participant_id = auth.uid())
                                                               with check (participant_id = auth.uid());

create policy "own pss10: select"      on public.pss10_responses for select using (participant_id = auth.uid());
create policy "own pss10: insert"      on public.pss10_responses for insert with check (participant_id = auth.uid());

create policy "own baseline: select"   on public.healme_baseline_responses for select using (participant_id = auth.uid());
create policy "own baseline: insert"   on public.healme_baseline_responses for insert with check (participant_id = auth.uid());
```

Sem políticas de `update`/`delete` nas respostas → **os dados são imutáveis** depois de submetidos (integridade científica). Os investigadores leem tudo pelo Supabase Studio / service role.

### Vista de tracking (o que a equipa vai usar)

```sql
create or replace view public.v_tracking
with (security_invoker = true) as
select
  p.polar_id,
  p.display_name,
  s.id           as session_id,
  s.timepoint,
  s.started_at,
  s.completed_at,
  s.status,
  pss.submitted_at as pss10_submitted_at,
  pss.total_score  as pss10_total,
  hm.submitted_at  as baseline_submitted_at
from public.form_sessions s
join public.participants p                     on p.id = s.participant_id
left join public.pss10_responses pss           on pss.session_id = s.id
left join public.healme_baseline_responses hm  on hm.session_id = s.id
order by p.polar_id, s.started_at;
```

Cada preenchimento é uma **linha nova** — nada é sobrescrito. Assim vê-se, por participante, o que respondeu em cada momento.

---

## 5. Auth, contas e persistência do sign-in

**Contas (criadas pelo admin, sign-up público DESATIVADO no dashboard do Supabase):**

| Campo | Padrão |
|---|---|
| Email | `polar01@healme.pt`, `polar02@healme.pt`, … `polarNN@healme.pt` |
| Password | **igual para todos**, lida de `SEED_PARTICIPANT_PASSWORD` no `.env.local` |
| `polar_id` | `H01`, `H02`, … |
| `display_name` | `polar h01`, `polar h02`, … |

`scripts/seed-participants.ts`: usa `supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { polar_id, display_name } })` com a **service role key**. Tem de ser **idempotente** (se a conta já existir, salta). Número de contas em `SEED_PARTICIPANT_COUNT`.

**Ecrã de login (`/login`):** o campo principal é **"Número da banda Polar"** (a pessoa escreve `01`, `02`, …) + password. A app constrói o email `polar${n}@healme.pt` por trás. Aceitar também o email completo, como fallback.

**Persistência da sessão — requisito central:**
- Usar `@supabase/ssr` com sessão em **cookies** (`createBrowserClient` + `createServerClient` + `middleware.ts` a refrescar o token em cada request).
- Resultado esperado: a pessoa faz sign-in **uma vez** e continua autenticada em visitas seguintes, dias/semanas depois, sem voltar a introduzir credenciais.
- No dashboard do Supabase (Authentication → Sessions): **sem inactivity timeout e sem time-box de sessão**. Documenta isto no README.
- Ainda assim, incluir um botão discreto **"Sair"** no dashboard.
- `middleware.ts` protege tudo exceto `/login`.

---

## 6. Fluxo da aplicação

```
/login  →  /  (dashboard)  →  /preencher/pss10  →  /preencher/baseline  →  /concluido
```

1. **`/` (dashboard)** — "Olá, polar h01". Botão **"Iniciar novo preenchimento"** + histórico dos preenchimentos anteriores (data/hora + estado). **Nunca mostrar pontuações.**
2. **"Iniciar"** → cria um registo em `form_sessions` (`status = 'in_progress'`) e navega para o PSS-10.
3. **`/preencher/pss10`** — Formulário 1. Ao submeter: `INSERT` em `pss10_responses` com o `session_id`. Botão diz **"Continuar para o formulário seguinte"**.
4. **`/preencher/baseline`** — Formulário 2. Ao submeter: `INSERT` em `healme_baseline_responses` + marcar a sessão `completed` (`completed_at = now()`).
5. **`/concluido`** — agradecimento + voltar ao dashboard.
6. Se a pessoa sair a meio, o dashboard mostra a sessão em curso e permite **retomar** no passo onde ficou.

**Rascunhos:** guardar as respostas em curso em `localStorage`, com chave por `session_id`; restaurar no reload; limpar após submissão com sucesso. Em caso de falha de rede, mostrar erro claro e permitir tentar de novo sem perder o que foi preenchido. (Os participantes vão preencher isto no telemóvel, possivelmente com má rede.)

---

## 7. Conteúdo VERBATIM — Formulário 1: PSS-10

`src/content/pss10.ts`

**Cabeçalho:**
```
Escala do Stresse Percepcionado
Perceived Stress Scale – PSS (10 item)
Cohen, Kamarck & Mermelstein (1983)
```
(o campo **Nome** do original é **removido**; o bloco de identificação da secção 9 substitui-o)

**Instrução (verbatim, não alterar):**
> Para cada questão, pedimos que indique com que frequência se sentiu ou pensou de determinada maneira, durante o último mês. Apesar de algumas perguntas serem parecidas, existem diferenças entre elas e deve responder a cada uma como perguntas separadas. Responda de forma rápida e espontânea. Para cada questão indique, com uma cruz (X), a alternativa que melhor se ajusta à sua situação.

> `// REVER COM A EQUIPA:` a expressão "com uma cruz (X)" vem do formato em papel. **Manter verbatim** até a equipa do estudo decidir o contrário. Não alterar por iniciativa própria.

**Escala (0–4), com estas 5 âncoras exatas:**

| 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Nunca | Quase nunca | Algumas vezes | Frequentemente | Muito frequente |

**Os 10 itens (verbatim, por esta ordem):**

1. No último mês, com que frequência esteve preocupado(a) por causa de alguma coisa que aconteceu inesperadamente?
2. No último mês, com que frequência se sentiu incapaz de controlar as coisas importantes da sua vida?
3. No último mês, com que frequência se sentiu nervoso(a) e em stresse?
4. No último mês, com que frequência sentiu confiança na sua capacidade para enfrentar os seus problemas pessoais?
5. No último mês, com que frequência sentiu que as coisas estavam a correr à sua maneira?
6. No último mês, com que frequência sentiu que não aguentava com as coisas todas que tinha para fazer?
7. No último mês, com que frequência foi capaz de controlar as suas irritações?
8. No último mês, com que frequência sentiu ter tudo sob controlo?
9. No último mês, com que frequência se sentiu furioso(a) por coisas que ultrapassaram o seu controlo?
10. No último mês, com que frequência sentiu que as dificuldades se estavam a acumular tanto que não as conseguia ultrapassar?

**Rodapé de atribuição — obrigatório, mostrar no fim do formulário (verbatim):**
> Fonte: Cohen, S.; Kamarck, T. & Mermelstein, R. (1983). A global measure of perceived stress. Journal of Health and Social Behavior, 24 (December), 385-396. Tradução, preparação e adaptação da versão portuguesa da PSS de 10 itens: Trigo, M.; Canudo, N.; Branco, F. & Silva, D. (2010). Estudo das propriedades psicométricas da Perceived Stress Scale (PSS) na população portuguesa, Revista Psychologica, 53, 353-378.

**Pontuação:** itens **4, 5, 7 e 8** são invertidos (`4 - valor`). Total 0–40. Calculado na base de dados (coluna gerada). **Nunca visível ao participante.**

**Validação:** os 10 itens são obrigatórios. Se faltar algum, destacar quais e não submeter.

---

## 8. Conteúdo VERBATIM — Formulário 2: HEAL-ME Baseline Mínimo

`src/content/healme-baseline.ts`

**Cabeçalho:**
```
HEAL-ME-EGYPT-2026
Formulário Baseline Mínimo para Participante
Módulos complementares ao PSS-10 | Português de Portugal | v1.0
```
Rodapé/marca de página: `HE26 | Baseline minimo complementar ao PSS-10 | PT-PT v1.0 | Dados codificados por ID`

**Instruções (verbatim):**
> Responda com base no seu estado atual ou nos últimos 7 dias, conforme indicado. Não há respostas certas ou erradas. Pode deixar uma pergunta em branco se não quiser responder.
>
> Escala 0-10: 0 = nada / de todo; 10 = extremamente / totalmente.
>
> Nota PSS-10: O PSS-10 deve ser preenchido separadamente usando a versão validada/oficial escolhida para o estudo. Este documento contém apenas os módulos complementares mínimos.

> `// REVER COM A EQUIPA:` a "Nota PSS-10" refere-se ao formato em papel (aqui o PSS-10 é o passo anterior do mesmo fluxo). **Manter verbatim** até decisão da equipa.

Todos os itens 0–10 usam a mesma escala e, onde indicado, um campo de texto **"Notas opcionais"** (opcional, livre).

### 1. Bem-estar / wellbeing
*Período: últimos 7 dias.*

| Pergunta | Resposta | Notas |
|---|---|---|
| De forma geral, quão bem se sentiu? | 0–10 | Notas opcionais |
| Quão capaz se sentiu de lidar com as exigências do dia a dia? | 0–10 | Notas opcionais |
| Quão satisfeito/a se sentiu com a sua vida neste momento? | 0–10 | Notas opcionais |

### 2. Sono / sleep
*Período: responda sobre a noite anterior e o seu estado de hoje.*

| Pergunta | Resposta |
|---|---|
| A que horas se deitou ontem? | Hora: `[campo de hora]` |
| A que horas acordou hoje? | Hora: `[campo de hora]` |
| Quantas horas dormiu aproximadamente? | Horas/minutos: `[horas]` `[minutos]` |
| Qual foi a qualidade do seu sono? | 0–10 |
| Quão cansado/a ou fatigado/a se sente agora? | 0–10 |
| Tem algum sintoma físico relevante hoje? | ☐ Não ☐ Sim → *Se sim, qual?* `[texto]` |

> Detalhe de renderização permitido (não altera o texto): "Horas/minutos" é preenchido com **dois campos numéricos** (horas + minutos) em vez de texto livre, para garantir qualidade dos dados. A pergunta mantém-se verbatim.

### 3. Significado / meaning
*Período: últimos 7 dias.*

| Pergunta | Resposta | Notas |
|---|---|---|
| Quão forte foi o seu sentido de significado ou propósito? | 0–10 | Notas opcionais |
| Quão claro/a se sentiu em relação ao que é importante para si? | 0–10 | Notas opcionais |
| Quão ligado/a se sentiu a algo maior do que as preocupações do dia a dia? | 0–10 | Notas opcionais |

### 4. Conexão / connection
*Período: últimos 7 dias.*

| Pergunta | Resposta | Notas |
|---|---|---|
| Quão conectado/a se sentiu com outras pessoas? | 0–10 | Notas opcionais |
| Quão apoiado/a se sentiu por pessoas à sua volta? | 0–10 | Notas opcionais |
| Quão seguro/a se sentiu em relação ao grupo ou às pessoas com quem vai partilhar esta experiência? | 0–10 | Notas opcionais |

### 5. Enraizamento / groundedness
*Período: estado atual e últimos 7 dias.*

| Pergunta | Resposta | Notas |
|---|---|---|
| Quão enraizado/a ou estável se sente neste momento? | 0–10 | Notas opcionais |
| Quão presente se sente no corpo neste momento? | 0–10 | Notas opcionais |
| Quão capaz se sente de voltar à calma quando fica ativado/a emocionalmente? | 0–10 | Notas opcionais |

### Confirmação final
> Confirmo que respondi da forma mais honesta possível e que sei que posso deixar perguntas sem resposta.

- **Assinatura ou iniciais do participante:** `[texto]`
- **Data e hora de conclusão:** preenchido automaticamente na submissão (mostrar ao participante).

---

## 9. Bloco de identificação (comum aos dois formulários)

Componente `IdentificationBlock.tsx`, no topo de ambos os formulários:

| Campo | Comportamento |
|---|---|
| **ID do participante** | Pré-preenchido com o `polar_id` da conta. **Read-only.** |
| **Data** | Pré-preenchida com a data de hoje. Editável. |
| **Hora de início** | Pré-preenchida com a hora a que a sessão começou. Editável. |
| **Grupo** | ☐ Active ☐ Vacation ☐ Waitlist — pré-preenchido do perfil, se existir. (Só no HEAL-ME, como no original.) |
| **Timepoint** | `Baseline` (read-only; no HEAL-ME o original mostra "Baseline T-14 a T-7"). Guardado como texto para permitir outros timepoints no futuro sem mudar o schema. |
| **Língua** | `Português` (read-only). |
| **Preenchido por** | ☐ Participante ☐ Operador — obrigatório. Default: Participante. |
| **Versão do formulário** | `v1.0` (read-only; só no HEAL-ME). |

**Sem campo de nome. Em lado nenhum. Nunca.**

**Fusos horários:** guardar sempre `timestamptz` (UTC). Mostrar e pré-preencher Data/Hora num fuso configurável via `NEXT_PUBLIC_STUDY_TIMEZONE` (o estudo é no Egito — default `Europe/Lisbon`, mas tem de ser trocável para `Africa/Cairo` sem mexer no código).

---

## 10. UI / UX

- **Mobile-first.** Vão preencher no telemóvel. Alvos de toque grandes nas escalas 0–4 e 0–10; nada de sliders finos.
- Um componente `ScaleRadio` reutilizável, parametrizado por `min`, `max` e `labels`. Radios acessíveis (`role="radiogroup"`, labels associadas, navegação por teclado, foco visível).
- Barra de progresso ("Formulário 1 de 2", "Formulário 2 de 2").
- **Nunca mostrar pontuações, interpretações ou feedback clínico** ao participante.
- PT-PT em toda a interface. Nada de português do Brasil.
- Design sóbrio e legível: alto contraste, tipografia grande, sem distrações.

---

## 11. Configuração e segurança

`.env.example`:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # só local/scripts — NUNCA exposta ao cliente
NEXT_PUBLIC_STUDY_TIMEZONE=Europe/Lisbon
SEED_PARTICIPANT_COUNT=30
SEED_PARTICIPANT_PASSWORD=        # password partilhada dos participantes
```

- `.env.local` no `.gitignore`. **Nunca** commitar a service role key nem a password.
- Sign-up público **desativado** no Supabase.
- Sem nomes, sem emails pessoais, sem dados identificáveis na base de dados. A chave que liga `polar_id` ↔ pessoa vive **fora** do sistema (documento offline da equipa).

---

## 12. README

Instruções passo a passo para WSL: pré-requisitos (Node 20+, Supabase CLI), criar o projeto Supabase, `supabase link`, `supabase db push`, `.env.local`, `npm run seed`, `npm run dev`, e a configuração de sessão no dashboard (sem timeout). Mais uma secção "Como exportar os dados" (Supabase Studio → `v_tracking` e as duas tabelas → CSV).

---

## 13. Definition of Done — verifica tudo isto antes de dizer que acabaste

- [ ] `npm run dev` arranca em WSL sem erros; `npm run build` passa.
- [ ] Login com `01` + password funciona; sessão **persiste** depois de fechar e reabrir o browser.
- [ ] Rotas protegidas: sem sessão, tudo redireciona para `/login`.
- [ ] Preenchimento completo cria **1 linha** em `form_sessions`, **1** em `pss10_responses` e **1** em `healme_baseline_responses`, todas com o mesmo `session_id`.
- [ ] Um segundo preenchimento pelo mesmo participante cria **linhas novas** (nada é sobrescrito) e aparece no dashboard como entrada separada com timestamp próprio.
- [ ] `v_tracking` mostra, por participante, cada momento de preenchimento e os respetivos timestamps.
- [ ] RLS testado: o participante `H01` **não consegue** ler os dados do `H02`.
- [ ] `total_score` do PSS-10 correto (verificar à mão com os itens 4/5/7/8 invertidos, ex.: todas as respostas a `2` → total `20`).
- [ ] Nenhum campo de nome em lado nenhum.
- [ ] `npm run print-content` imprime todo o texto dos dois formulários — **compara linha a linha com os PDFs em `docs/fontes/` e confirma que está idêntico.**
- [ ] Nenhuma pontuação visível ao participante.
- [ ] Todos os campos do HEAL-ME aceitam ficar em branco.