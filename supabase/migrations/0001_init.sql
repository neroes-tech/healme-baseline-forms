-- supabase/migrations/0001_init.sql
-- HEAL-ME-EGYPT-2026 (HE26) — esquema inicial
-- Dados imutáveis após submissão (integridade científica). Nenhum dado identificável.
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

-- ---------- Trigger: criar o perfil a partir da conta de auth ----------
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

-- ---------- RLS (dados imutáveis) ----------
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

-- Sem políticas de update/delete nas respostas → dados imutáveis depois de submetidos.
-- Os investigadores leem tudo pelo Supabase Studio / service role.

-- ---------- Vista de tracking (o que a equipa vai usar) ----------
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
