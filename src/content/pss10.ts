// src/content/pss10.ts
// ÚNICA fonte do texto do PSS-10.
// REGRA DE OURO: texto VERBATIM do PDF (docs/fontes/pss10_portuguese_scale_only...pdf).
// Não reescrever, não "melhorar", não corrigir, não traduzir, não abreviar, não reordenar.
// O PSS-10 é uma escala validada — qualquer alteração de texto invalida os dados.

export const PSS10_HEADER = {
  title: "Escala do Stresse Percepcionado",
  subtitle: "Perceived Stress Scale – PSS (10 item)",
  authors: "Cohen, Kamarck & Mermelstein (1983)",
  // O campo "Nome" do original é REMOVIDO; o IdentificationBlock substitui-o.
} as const;

export const PSS10_INSTRUCTION =
  // REVER COM A EQUIPA: a expressão "com uma cruz (X)" vem do formato em papel.
  // Manter verbatim até a equipa do estudo decidir o contrário. Não alterar por iniciativa própria.
  "Para cada questão, pedimos que indique com que frequência se sentiu ou pensou de determinada maneira, durante o último mês. Apesar de algumas perguntas serem parecidas, existem diferenças entre elas e deve responder a cada uma como perguntas separadas. Responda de forma rápida e espontânea. Para cada questão indique, com uma cruz (X), a alternativa que melhor se ajusta à sua situação.";

// Escala 0–4, com estas 5 âncoras exatas.
export const PSS10_SCALE_LABELS = [
  "Nunca",
  "Quase nunca",
  "Algumas vezes",
  "Frequentemente",
  "Muito frequente",
] as const;

export const PSS10_SCALE_MIN = 0;
export const PSS10_SCALE_MAX = 4;

// Os 10 itens (verbatim, por esta ordem).
export const PSS10_ITEMS: readonly { key: Pss10ItemKey; text: string }[] = [
  {
    key: "q1",
    text: "No último mês, com que frequência esteve preocupado(a) por causa de alguma coisa que aconteceu inesperadamente?",
  },
  {
    key: "q2",
    text: "No último mês, com que frequência se sentiu incapaz de controlar as coisas importantes da sua vida?",
  },
  {
    key: "q3",
    text: "No último mês, com que frequência se sentiu nervoso(a) e em stresse?",
  },
  {
    key: "q4",
    text: "No último mês, com que frequência sentiu confiança na sua capacidade para enfrentar os seus problemas pessoais?",
  },
  {
    key: "q5",
    text: "No último mês, com que frequência sentiu que as coisas estavam a correr à sua maneira?",
  },
  {
    key: "q6",
    text: "No último mês, com que frequência sentiu que não aguentava com as coisas todas que tinha para fazer?",
  },
  {
    key: "q7",
    text: "No último mês, com que frequência foi capaz de controlar as suas irritações?",
  },
  {
    key: "q8",
    text: "No último mês, com que frequência sentiu ter tudo sob controlo?",
  },
  {
    key: "q9",
    text: "No último mês, com que frequência se sentiu furioso(a) por coisas que ultrapassaram o seu controlo?",
  },
  {
    key: "q10",
    text: "No último mês, com que frequência sentiu que as dificuldades se estavam a acumular tanto que não as conseguia ultrapassar?",
  },
] as const;

export type Pss10ItemKey =
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "q8"
  | "q9"
  | "q10";

// Rodapé de atribuição — obrigatório, mostrar no fim do formulário (verbatim).
export const PSS10_ATTRIBUTION =
  "Fonte: Cohen, S.; Kamarck, T. & Mermelstein, R. (1983). A global measure of perceived stress. Journal of Health and Social Behavior, 24 (December), 385-396. Tradução, preparação e adaptação da versão portuguesa da PSS de 10 itens: Trigo, M.; Canudo, N.; Branco, F. & Silva, D. (2010). Estudo das propriedades psicométricas da Perceived Stress Scale (PSS) na população portuguesa, Revista Psychologica, 53, 353-378.";

// Itens 4, 5, 7 e 8 são invertidos (4 - valor). Total 0–40.
// A pontuação é calculada na base de dados (coluna gerada) e NUNCA é visível ao participante.
export const PSS10_REVERSED_ITEMS: readonly Pss10ItemKey[] = ["q4", "q5", "q7", "q8"];
