// src/content/healme-baseline.ts
// ÚNICA fonte do texto do HEAL-ME Baseline Mínimo.
// REGRA DE OURO: texto VERBATIM do PDF
// (docs/fontes/HE26_Formulario_Baseline_Participante_PT_..._v1.pdf).
// Não reescrever, não "melhorar", não corrigir, não traduzir, não abreviar, não reordenar.
// Todos os campos de resposta são opcionais — "Pode deixar uma pergunta em branco se não quiser responder."

export const HEALME_HEADER = {
  study: "HEAL-ME-EGYPT-2026",
  title: "Formulário Baseline Mínimo para Participante",
  subtitle: "Módulos complementares ao PSS-10 | Português de Portugal | v1.0",
} as const;

export const HEALME_PAGE_MARK =
  "HE26 | Baseline minimo complementar ao PSS-10 | PT-PT v1.0 | Dados codificados por ID";

// Instruções (verbatim). A "Nota PSS-10" é mantida verbatim.
export const HEALME_INSTRUCTIONS = {
  responder:
    "Responda com base no seu estado atual ou nos últimos 7 dias, conforme indicado. Não há respostas certas ou erradas. Pode deixar uma pergunta em branco se não quiser responder.",
  escala: "Escala 0-10: 0 = nada / de todo; 10 = extremamente / totalmente.",
  // REVER COM A EQUIPA: a "Nota PSS-10" refere-se ao formato em papel
  // (aqui o PSS-10 é o passo anterior do mesmo fluxo). Manter verbatim até decisão da equipa.
  notaPss10:
    "Nota PSS-10: O PSS-10 deve ser preenchido separadamente usando a versão validada/oficial escolhida para o estudo. Este documento contém apenas os módulos complementares mínimos.",
} as const;

export const HEALME_SCALE_MIN = 0;
export const HEALME_SCALE_MAX = 10;
export const NOTAS_LABEL = "Notas opcionais";

// Um item de escala 0–10 com notas opcionais.
export type ScaleItem = {
  key: string;
  notasKey: string;
  text: string;
};

// ------------------------------------------------------------------
// 1. Bem-estar / wellbeing — Período: últimos 7 dias.
// ------------------------------------------------------------------
export const SECAO_BEM_ESTAR = {
  numero: "1",
  titulo: "Bem-estar / wellbeing",
  periodo: "Período: últimos 7 dias.",
  itens: [
    {
      key: "wb_geral",
      notasKey: "wb_geral_notas",
      text: "De forma geral, quão bem se sentiu?",
    },
    {
      key: "wb_lidar_exigencias",
      notasKey: "wb_lidar_exigencias_notas",
      text: "Quão capaz se sentiu de lidar com as exigências do dia a dia?",
    },
    {
      key: "wb_satisfacao_vida",
      notasKey: "wb_satisfacao_vida_notas",
      text: "Quão satisfeito/a se sentiu com a sua vida neste momento?",
    },
  ] satisfies ScaleItem[],
} as const;

// ------------------------------------------------------------------
// 2. Sono / sleep — Período: responda sobre a noite anterior e o seu estado de hoje.
// ------------------------------------------------------------------
export const SECAO_SONO = {
  numero: "2",
  titulo: "Sono / sleep",
  periodo: "Período: responda sobre a noite anterior e o seu estado de hoje.",
  perguntas: {
    horaDeitar: "A que horas se deitou ontem?",
    horaAcordar: "A que horas acordou hoje?",
    // Detalhe de renderização permitido: dois campos numéricos (horas + minutos).
    // A pergunta mantém-se verbatim.
    duracao: "Quantas horas dormiu aproximadamente?",
    qualidade: "Qual foi a qualidade do seu sono?",
    fadiga: "Quão cansado/a ou fatigado/a se sente agora?",
    sintomas: "Tem algum sintoma físico relevante hoje?",
    sintomasSeSim: "Se sim, qual?",
  },
  // Escala 0–10 para qualidade e fadiga.
  itensEscala: [
    { key: "sono_qualidade", label: "Qual foi a qualidade do seu sono?" },
    { key: "fadiga_agora", label: "Quão cansado/a ou fatigado/a se sente agora?" },
  ],
} as const;

// ------------------------------------------------------------------
// 3. Significado / meaning — Período: últimos 7 dias.
// ------------------------------------------------------------------
export const SECAO_SIGNIFICADO = {
  numero: "3",
  titulo: "Significado / meaning",
  periodo: "Período: últimos 7 dias.",
  itens: [
    {
      key: "sig_proposito",
      notasKey: "sig_proposito_notas",
      text: "Quão forte foi o seu sentido de significado ou propósito?",
    },
    {
      key: "sig_clareza",
      notasKey: "sig_clareza_notas",
      text: "Quão claro/a se sentiu em relação ao que é importante para si?",
    },
    {
      key: "sig_ligacao_maior",
      notasKey: "sig_ligacao_maior_notas",
      text: "Quão ligado/a se sentiu a algo maior do que as preocupações do dia a dia?",
    },
  ] satisfies ScaleItem[],
} as const;

// ------------------------------------------------------------------
// 4. Conexão / connection — Período: últimos 7 dias.
// ------------------------------------------------------------------
export const SECAO_CONEXAO = {
  numero: "4",
  titulo: "Conexão / connection",
  periodo: "Período: últimos 7 dias.",
  itens: [
    {
      key: "con_conectado",
      notasKey: "con_conectado_notas",
      text: "Quão conectado/a se sentiu com outras pessoas?",
    },
    {
      key: "con_apoiado",
      notasKey: "con_apoiado_notas",
      text: "Quão apoiado/a se sentiu por pessoas à sua volta?",
    },
    {
      key: "con_seguranca_grupo",
      notasKey: "con_seguranca_grupo_notas",
      text: "Quão seguro/a se sentiu em relação ao grupo ou às pessoas com quem vai partilhar esta experiência?",
    },
  ] satisfies ScaleItem[],
} as const;

// ------------------------------------------------------------------
// 5. Enraizamento / groundedness — Período: estado atual e últimos 7 dias.
// ------------------------------------------------------------------
export const SECAO_ENRAIZAMENTO = {
  numero: "5",
  titulo: "Enraizamento / groundedness",
  periodo: "Período: estado atual e últimos 7 dias.",
  itens: [
    {
      key: "enr_estavel",
      notasKey: "enr_estavel_notas",
      text: "Quão enraizado/a ou estável se sente neste momento?",
    },
    {
      key: "enr_presente_corpo",
      notasKey: "enr_presente_corpo_notas",
      text: "Quão presente se sente no corpo neste momento?",
    },
    {
      key: "enr_voltar_calma",
      notasKey: "enr_voltar_calma_notas",
      text: "Quão capaz se sente de voltar à calma quando fica ativado/a emocionalmente?",
    },
  ] satisfies ScaleItem[],
} as const;

// ------------------------------------------------------------------
// Confirmação final
// ------------------------------------------------------------------
export const HEALME_CONFIRMACAO = {
  titulo: "Confirmação final",
  texto:
    "Confirmo que respondi da forma mais honesta possível e que sei que posso deixar perguntas sem resposta.",
  labelIniciais: "Assinatura ou iniciais do participante",
  labelDataHora: "Data e hora de conclusão",
} as const;

// Todas as secções com itens de escala 0–10 + notas (usado no proofreading e na renderização).
export const HEALME_SECOES_ESCALA = [
  SECAO_BEM_ESTAR,
  SECAO_SIGNIFICADO,
  SECAO_CONEXAO,
  SECAO_ENRAIZAMENTO,
] as const;
