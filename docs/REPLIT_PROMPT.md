# Prompt para o Replit — app de formulários HEAL-ME-EGYPT-2026

> Copia tudo abaixo da linha e cola no agente do Replit.

---

Constrói uma aplicação web completa, do zero, para recolher dois questionários de um estudo científico. **Usa o TEU próprio estilo visual e as tuas próprias decisões de design** — não sigas nenhum guia de estilo específico. Quero ver a tua interpretação de um design moderno, limpo, mobile-first e acessível. **Tudo o resto (funcionalidade, dados, textos dos questionários) tem de ser exatamente como está descrito.**

## 0. Contexto

Estudo **HEAL-ME-EGYPT-2026 (HE26)**. Os participantes preenchem **dois questionários em sequência** (Formulário 1 = PSS-10, depois Formulário 2 = HEAL-ME Baseline), **várias vezes ao longo do tempo**. Cada participante é identificado **apenas** pelo **número da banda Polar** — **nunca por nome**. É um instrumento de investigação: os dados têm de ser fiáveis, imutáveis e rastreáveis por participante e por momento.

## 1. REGRA DE OURO (não negociável)

**O texto dos questionários tem de ficar EXATAMENTE igual ao que forneço abaixo: mesmo texto, mesma ordem, mesmas escalas, mesmas opções.** Não reescrever, não "melhorar", não corrigir ortografia, não traduzir, não abreviar, não reordenar. O PSS-10 é uma **escala validada** — qualquer alteração de texto invalida os dados. Copia as strings caracter a caracter (em Português de Portugal). A **única** liberdade é o design visual (cores, tipografia, espaçamento, componentes, animações) — o *conteúdo* é fixo.

## 2. Estilo (aqui és livre)

- Aplica o **teu** sistema de design: escolhe paleta, tipografia e componentes que aches melhores.
- Requisitos de qualidade que tens de cumprir na mesma:
  - **Mobile-first** — os participantes preenchem no telemóvel, às vezes com má rede.
  - **Acessível** — WCAG AA: alto contraste, foco visível, navegação por teclado, `aria` correto, alvos de toque grandes (≥ 44px) nas escalas.
  - **Sóbrio e legível** — tipografia grande, sem distrações, PT-PT em toda a interface (nada de português do Brasil).
- **Favicon:** deixa um espaço/ficheiro placeholder para eu colocar o favicon da empresa (ex.: `public/favicon.ico` ou `app/icon.png`). Não inventes um logótipo.
- **Rodapé:** em todas as páginas, no fim, mostra **"Powered by"** seguido de um logótipo (usa um placeholder tipo `public/logo.svg` que eu depois substituo pelo logótipo da empresa).

## 3. Stack

Recomendo **Next.js (App Router) + TypeScript + Supabase (Postgres + Auth + RLS)**, com sessão persistida em cookies via `@supabase/ssr`. Se preferires um equivalente em que sejas mais forte, podes trocar **desde que cumpras todas as garantias** (auth, RLS/isolamento por utilizador, imutabilidade, sessão persistente, migrações versionadas). Mantém as migrações SQL versionadas.

## 4. Modelo de dados

Uma tabela **por formulário**, mais uma tabela de **sessão** que liga os dois preenchimentos do mesmo momento (é isto que permite tracking por participante e por timestamp). Cada preenchimento é uma **linha nova** — nada é sobrescrito.

**`participants`** (perfil, 1:1 com o utilizador de auth):
- `id` (PK, = id do utilizador de auth), `polar_id` (texto único, ex. `H01`), `display_name` (ex. `polar h01`), `email` (único, ex. `polar01@healme.pt`), `polar_band_serial` (opcional), `study_group` (enum opcional: `active` | `vacation` | `waitlist`), `created_at`.
- Criado automaticamente por trigger quando a conta de auth é criada (lê `polar_id` e `display_name` dos metadados do utilizador).

**`form_sessions`** (liga PSS-10 + Baseline do mesmo momento):
- `id` (PK), `participant_id` (FK), `polar_id`, `timepoint` (texto, default `Baseline`), `started_at`, `completed_at` (nullable), `status` (`in_progress` | `completed`).

**`pss10_responses`** (Formulário 1):
- `id`, `session_id` (FK único → uma resposta PSS-10 por sessão), `participant_id`, `polar_id`.
- Identificação: `form_date` (date), `start_time` (time), `timepoint` (default `Baseline`), `language` (default `Português`), `filled_by` (enum `participante` | `operador`).
- Itens: `q1`…`q10`, `smallint` **obrigatórios**, cada um entre 0 e 4.
- `total_score`: **coluna gerada** (`stored`), calculada assim (itens **4, 5, 7 e 8 invertidos** = `4 - valor`): `q1 + q2 + q3 + (4-q4) + (4-q5) + q6 + (4-q7) + (4-q8) + q9 + q10`. Total 0–40. **NUNCA mostrada ao participante.**
- `submitted_at`, `created_at`.

**`healme_baseline_responses`** (Formulário 2):
- `id`, `session_id` (FK único), `participant_id`, `polar_id`.
- Identificação: `form_date`, `start_time`, `study_group` (enum, nullable), `timepoint` (default `Baseline`), `language` (default `Português`), `filled_by`, `form_version` (default `v1.0`).
- **TODOS os campos de resposta são NULLABLE** (o formulário diz explicitamente que se pode deixar em branco). Campos:
  - **1. Bem-estar:** `wb_geral` (0–10) + `wb_geral_notas` (texto); `wb_lidar_exigencias` + `wb_lidar_exigencias_notas`; `wb_satisfacao_vida` + `wb_satisfacao_vida_notas`.
  - **2. Sono:** `sono_hora_deitar` (time), `sono_hora_acordar` (time), `sono_horas` (0–24), `sono_minutos` (0–59), `sono_duracao_min` (**coluna gerada** = horas*60+minutos, ou null se ambos null), `sono_qualidade` (0–10), `fadiga_agora` (0–10), `sintomas_fisicos` (boolean), `sintomas_fisicos_desc` (texto).
  - **3. Significado:** `sig_proposito` + `sig_proposito_notas`; `sig_clareza` + `sig_clareza_notas`; `sig_ligacao_maior` + `sig_ligacao_maior_notas`.
  - **4. Conexão:** `con_conectado` + `con_conectado_notas`; `con_apoiado` + `con_apoiado_notas`; `con_seguranca_grupo` + `con_seguranca_grupo_notas`.
  - **5. Enraizamento:** `enr_estavel` + `enr_estavel_notas`; `enr_presente_corpo` + `enr_presente_corpo_notas`; `enr_voltar_calma` + `enr_voltar_calma_notas`.
  - **Confirmação:** `confirmacao_iniciais` (texto), `concluido_em` (timestamp).
  - Todos os campos 0–10 com `check between 0 and 10`. `submitted_at`, `created_at`.

**Segurança / RLS (row-level security):**
- Cada participante só pode **ler e inserir os seus próprios dados** (`participant_id = utilizador autenticado`).
- **Sem políticas de UPDATE nem DELETE nas respostas** → os dados são **imutáveis** depois de submetidos (integridade científica). Os investigadores leem tudo por uma chave de serviço/admin.

**Vista de tracking `v_tracking`** (o que a equipa vai usar): uma linha por sessão com `polar_id`, `display_name`, `session_id`, `timepoint`, `started_at`, `completed_at`, `status`, `pss10_submitted_at`, `pss10_total`, `baseline_submitted_at` — juntando `form_sessions` + `participants` + as duas tabelas de respostas.

## 5. Auth, contas e sessão

- **Contas criadas pelo admin; sign-up público DESATIVADO.** Email `polar01@healme.pt`…`polarNN@healme.pt`; password **igual para todos** (lida de variável de ambiente); `polar_id` = `H01`, `H02`, …; `display_name` = `polar h01`, `polar h02`, …
- Cria um **script de seed idempotente** que cria N contas (N de variável de ambiente) com a service role key, marcando o email como confirmado e metendo `polar_id`/`display_name` nos metadados. Se a conta já existir, salta.
- **Ecrã de login:** campo principal **"Número da banda Polar"** (a pessoa escreve `01`, `02`, …) + password; a app constrói o email `polar${NN}@healme.pt` por trás. Aceita também o email completo como fallback.
- **Persistência da sessão (requisito central):** a pessoa faz sign-in **uma vez** e continua autenticada dias/semanas depois, sem voltar a introduzir credenciais (sessão em cookies + refresh de token em middleware; sem inactivity timeout nem time-box). Inclui um botão discreto **"Sair"**.
- **Proteção de rotas:** sem sessão, tudo redireciona para o login.

## 6. Fluxo da aplicação

`/login → / (dashboard) → PSS-10 → HEAL-ME Baseline → concluído`

1. **Dashboard:** "Olá, polar h01" + botão **"Iniciar novo preenchimento"** + histórico dos preenchimentos anteriores (data/hora + estado). **Nunca mostrar pontuações.**
2. **Iniciar** → cria uma linha em `form_sessions` (`in_progress`) e vai para o PSS-10.
3. **PSS-10** → ao submeter, insere em `pss10_responses` com o `session_id`. Botão: **"Continuar para o formulário seguinte"**.
4. **HEAL-ME Baseline** → ao submeter, insere em `healme_baseline_responses` + marca a sessão `completed`.
5. **Concluído** → agradecimento + voltar ao dashboard.
6. Se a pessoa sair a meio, o dashboard mostra a sessão em curso e permite **retomar** no passo onde ficou.
7. **Rascunhos:** guarda as respostas em curso em `localStorage` por `session_id`; restaura no reload; limpa após submissão. Em falha de rede, erro claro e permitir tentar de novo sem perder o preenchido.
8. Barra de progresso ("Formulário 1 de 2" / "Formulário 2 de 2").

## 7. Bloco de identificação (comum aos dois formulários, no topo)

Sem campo de nome. Em lado nenhum. Nunca. Campos:
- **ID do participante** — pré-preenchido com o `polar_id`, **read-only**.
- **Data** — pré-preenchida com hoje, editável.
- **Hora de início** — pré-preenchida com a hora de início da sessão, editável.
- **Grupo** — ☐ Active ☐ Vacation ☐ Waitlist (pré-preenchido do perfil, se existir). **Só no HEAL-ME.**
- **Timepoint** — `Baseline` (read-only; no HEAL-ME o original mostra "Baseline T-14 a T-7"). Guardar como texto.
- **Língua** — `Português` (read-only).
- **Preenchido por** — ☐ Participante ☐ Operador — obrigatório, default Participante.
- **Versão do formulário** — `v1.0` (read-only; só no HEAL-ME).
- **Fusos horários:** guardar sempre em UTC; mostrar/pré-preencher Data/Hora num fuso configurável por variável de ambiente (estudo no Egito — default `Europe/Lisbon`, trocável para `Africa/Cairo` sem mexer no código).

---

## 8. CONTEÚDO VERBATIM — Formulário 1: PSS-10

**Cabeçalho** (o campo "Nome" do original é REMOVIDO; substituído pelo bloco de identificação):
```
Escala do Stresse Percepcionado
Perceived Stress Scale – PSS (10 item)
Cohen, Kamarck & Mermelstein (1983)
```

**Instrução (verbatim, não alterar):**
> Para cada questão, pedimos que indique com que frequência se sentiu ou pensou de determinada maneira, durante o último mês. Apesar de algumas perguntas serem parecidas, existem diferenças entre elas e deve responder a cada uma como perguntas separadas. Responda de forma rápida e espontânea. Para cada questão indique, com uma cruz (X), a alternativa que melhor se ajusta à sua situação.

**Escala (0–4), 5 âncoras exatas:**
| 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Nunca | Quase nunca | Algumas vezes | Frequentemente | Muito frequente |

**Os 10 itens (verbatim, por esta ordem; todos obrigatórios):**
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

**Pontuação:** itens **4, 5, 7 e 8** invertidos (`4 - valor`); total 0–40; calculado na base de dados (coluna gerada); **NUNCA visível ao participante.** Validação: os 10 itens são obrigatórios; se faltar algum, destacar quais e não submeter.

---

## 9. CONTEÚDO VERBATIM — Formulário 2: HEAL-ME Baseline Mínimo

**Cabeçalho:**
```
HEAL-ME-EGYPT-2026
Formulário Baseline Mínimo para Participante
Módulos complementares ao PSS-10 | Português de Portugal | v1.0
```
**Marca de rodapé/página:** `HE26 | Baseline minimo complementar ao PSS-10 | PT-PT v1.0 | Dados codificados por ID`

**Instruções (verbatim):**
> Responda com base no seu estado atual ou nos últimos 7 dias, conforme indicado. Não há respostas certas ou erradas. Pode deixar uma pergunta em branco se não quiser responder.
>
> Escala 0-10: 0 = nada / de todo; 10 = extremamente / totalmente.
>
> Nota PSS-10: O PSS-10 deve ser preenchido separadamente usando a versão validada/oficial escolhida para o estudo. Este documento contém apenas os módulos complementares mínimos.

Todos os itens 0–10 usam a mesma escala e têm um campo de texto **"Notas opcionais"** (opcional, livre), exceto onde indicado. **Todos os campos podem ficar em branco.**

**1. Bem-estar / wellbeing** — *Período: últimos 7 dias.*
- De forma geral, quão bem se sentiu? — 0–10 + Notas opcionais
- Quão capaz se sentiu de lidar com as exigências do dia a dia? — 0–10 + Notas opcionais
- Quão satisfeito/a se sentiu com a sua vida neste momento? — 0–10 + Notas opcionais

**2. Sono / sleep** — *Período: responda sobre a noite anterior e o seu estado de hoje.*
- A que horas se deitou ontem? — campo de hora
- A que horas acordou hoje? — campo de hora
- Quantas horas dormiu aproximadamente? — dois campos numéricos (horas + minutos) *(detalhe de renderização permitido; a pergunta mantém-se verbatim)*
- Qual foi a qualidade do seu sono? — 0–10
- Quão cansado/a ou fatigado/a se sente agora? — 0–10
- Tem algum sintoma físico relevante hoje? — ☐ Não ☐ Sim → *Se sim, qual?* (campo de texto)

**3. Significado / meaning** — *Período: últimos 7 dias.*
- Quão forte foi o seu sentido de significado ou propósito? — 0–10 + Notas opcionais
- Quão claro/a se sentiu em relação ao que é importante para si? — 0–10 + Notas opcionais
- Quão ligado/a se sentiu a algo maior do que as preocupações do dia a dia? — 0–10 + Notas opcionais

**4. Conexão / connection** — *Período: últimos 7 dias.*
- Quão conectado/a se sentiu com outras pessoas? — 0–10 + Notas opcionais
- Quão apoiado/a se sentiu por pessoas à sua volta? — 0–10 + Notas opcionais
- Quão seguro/a se sentiu em relação ao grupo ou às pessoas com quem vai partilhar esta experiência? — 0–10 + Notas opcionais

**5. Enraizamento / groundedness** — *Período: estado atual e últimos 7 dias.*
- Quão enraizado/a ou estável se sente neste momento? — 0–10 + Notas opcionais
- Quão presente se sente no corpo neste momento? — 0–10 + Notas opcionais
- Quão capaz se sente de voltar à calma quando fica ativado/a emocionalmente? — 0–10 + Notas opcionais

**Confirmação final:**
> Confirmo que respondi da forma mais honesta possível e que sei que posso deixar perguntas sem resposta.
- **Assinatura ou iniciais do participante:** campo de texto
- **Data e hora de conclusão:** preenchido automaticamente na submissão (mostrar ao participante).

---

## 10. Configuração e segurança

- Variáveis de ambiente para URL/chaves do backend, service role key (só local/scripts — nunca exposta ao cliente), fuso do estudo, nº de participantes e password partilhada. Ficheiro `.env` no `.gitignore`.
- Sign-up público desativado. Sem nomes, sem emails pessoais, sem dados identificáveis. A chave `polar_id ↔ pessoa` vive **fora** do sistema (documento offline da equipa).
- README com passo a passo: criar o backend, aplicar migrações, `.env`, seed das contas, correr em dev, e como exportar os dados (a vista `v_tracking` e as duas tabelas para CSV).

## 11. Definition of Done (verifica antes de dizeres que acabaste)

- [ ] A app arranca sem erros e o build passa.
- [ ] Login com `01` + password funciona; a sessão **persiste** depois de fechar e reabrir o browser.
- [ ] Sem sessão, tudo redireciona para o login.
- [ ] Um preenchimento completo cria **1 linha** em cada uma das 3 tabelas, todas com o mesmo `session_id`.
- [ ] Um segundo preenchimento cria **linhas novas** (nada sobrescrito) e aparece no dashboard como entrada separada com timestamp próprio.
- [ ] `v_tracking` mostra, por participante, cada momento e os respetivos timestamps.
- [ ] Isolamento testado: o participante H01 **não consegue** ler os dados do H02.
- [ ] `total_score` do PSS-10 correto (ex.: todas as respostas a `2` → total `20`, por causa dos itens 4/5/7/8 invertidos).
- [ ] Nenhum campo de nome em lado nenhum. Nenhuma pontuação visível ao participante.
- [ ] Todos os campos do HEAL-ME aceitam ficar em branco.
- [ ] Favicon com placeholder e rodapé "Powered by" + logótipo placeholder em todas as páginas.
- [ ] Design mobile-first e acessível (o teu estilo próprio).
