// scripts/print-content.ts
// Imprime TODO o texto dos dois formulários para proofreading.
//   npm run print-content
// Compara a saída linha a linha com os PDFs em docs/fontes/.
import {
  PSS10_ATTRIBUTION,
  PSS10_HEADER,
  PSS10_INSTRUCTION,
  PSS10_ITEMS,
  PSS10_SCALE_LABELS,
} from "../src/content/pss10";
import {
  HEALME_CONFIRMACAO,
  HEALME_HEADER,
  HEALME_INSTRUCTIONS,
  HEALME_PAGE_MARK,
  SECAO_BEM_ESTAR,
  SECAO_CONEXAO,
  SECAO_ENRAIZAMENTO,
  SECAO_SIGNIFICADO,
  SECAO_SONO,
  type ScaleItem,
} from "../src/content/healme-baseline";

function hr(label: string) {
  console.log("\n" + "=".repeat(72));
  console.log(label);
  console.log("=".repeat(72));
}

function printScaleSection(section: {
  numero: string;
  titulo: string;
  periodo: string;
  itens: readonly ScaleItem[];
}) {
  console.log(`\n${section.numero}. ${section.titulo}`);
  console.log(section.periodo);
  for (const item of section.itens) {
    console.log(`  - ${item.text}   [0–10]   (${"Notas opcionais"})`);
  }
}

// ---------- PSS-10 ----------
hr("FORMULÁRIO 1 — PSS-10");
console.log(PSS10_HEADER.title);
console.log(PSS10_HEADER.subtitle);
console.log(PSS10_HEADER.authors);
console.log("\nInstrução:");
console.log(PSS10_INSTRUCTION);
console.log("\nEscala (0–4):");
PSS10_SCALE_LABELS.forEach((l, i) => console.log(`  ${i} = ${l}`));
console.log("\nItens:");
PSS10_ITEMS.forEach((item, i) => console.log(`  ${i + 1}. ${item.text}`));
console.log("\nRodapé de atribuição:");
console.log(PSS10_ATTRIBUTION);

// ---------- HEAL-ME ----------
hr("FORMULÁRIO 2 — HEAL-ME BASELINE MÍNIMO");
console.log(HEALME_PAGE_MARK);
console.log("\n" + HEALME_HEADER.study);
console.log(HEALME_HEADER.title);
console.log(HEALME_HEADER.subtitle);
console.log("\nInstruções:");
console.log(HEALME_INSTRUCTIONS.responder);
console.log(HEALME_INSTRUCTIONS.escala);
console.log(HEALME_INSTRUCTIONS.notaPss10);

printScaleSection(SECAO_BEM_ESTAR);

console.log(`\n${SECAO_SONO.numero}. ${SECAO_SONO.titulo}`);
console.log(SECAO_SONO.periodo);
console.log(`  - ${SECAO_SONO.perguntas.horaDeitar}   [Hora]`);
console.log(`  - ${SECAO_SONO.perguntas.horaAcordar}   [Hora]`);
console.log(`  - ${SECAO_SONO.perguntas.duracao}   [Horas/minutos]`);
console.log(`  - ${SECAO_SONO.perguntas.qualidade}   [0–10]`);
console.log(`  - ${SECAO_SONO.perguntas.fadiga}   [0–10]`);
console.log(
  `  - ${SECAO_SONO.perguntas.sintomas}   [Não / Sim]  ${SECAO_SONO.perguntas.sintomasSeSim}`,
);

printScaleSection(SECAO_SIGNIFICADO);
printScaleSection(SECAO_CONEXAO);
printScaleSection(SECAO_ENRAIZAMENTO);

console.log(`\n${HEALME_CONFIRMACAO.titulo}`);
console.log(HEALME_CONFIRMACAO.texto);
console.log(`  - ${HEALME_CONFIRMACAO.labelIniciais}`);
console.log(`  - ${HEALME_CONFIRMACAO.labelDataHora}`);
console.log("\n" + HEALME_PAGE_MARK + "\n");
