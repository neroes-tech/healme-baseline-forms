# Prompt 2 para o Replit — exportar o guia de estilo

> Envia isto ao Replit **depois** de ele ter construído a app. Objetivo: obter um documento
> completo com TODO o sistema de estilo, para que possa ser replicado com fidelidade noutra
> base de código.

---

A app está construída. Agora quero que geres **um único ficheiro `STYLE_GUIDE.md`** na raiz do projeto que documente, de forma completa e autossuficiente, **todo o sistema visual** que usaste — com detalhe suficiente para que outra pessoa consiga **replicar o aspeto pixel a pixel noutra base de código, sem ver o teu projeto**. Não incluas o texto dos questionários (não é preciso). Foca-te só no estilo.

Inclui, com **valores exatos** (hex, px/rem, ms), as seguintes secções:

1. **Stack de estilo** — que abordagem usaste (Tailwind? CSS Modules? styled-components? CSS puro?). Se usaste Tailwind, **cola o `tailwind.config` completo** e o `globals.css` (com `@theme`/variáveis). Se usaste CSS variables, **lista todas** com os valores.

2. **Tokens de design (tabela no topo):**
   - **Cores** — todas as cores da paleta com **nome, valor hex, e uso** (fundo de página, superfície/card, texto principal, texto secundário, borda, primária, primária-hover, estados de foco, sucesso, erro/aviso). Indica os rácios de contraste principais (texto sobre fundo) e confirma WCAG AA.
   - **Tipografia** — família(s) de fonte e **como são carregadas** (Google Fonts? `next/font`? import?), e a escala completa: cada nível (h1, h2, h3, corpo, legenda) com `font-size`, `font-weight`, `line-height`, `letter-spacing`.
   - **Espaçamento** — a escala usada (ex.: 4/8/12/16/24/32…).
   - **Raios de canto**, **sombras**, **larguras de borda**, **breakpoints** e **larguras máximas de conteúdo**.
   - **Transições/animações** — durações e easing.

3. **Estilos globais** — cor de fundo do body, cor de texto base, e o **estilo do anel de foco** (`:focus-visible`).

4. **Componentes (com o CSS/classes exatos de cada um):**
   - Botões: **primário** e **secundário**, tamanhos, e **todos os estados** (normal, hover, focus-visible, active, disabled).
   - Inputs de texto / data / hora / número, e textarea (normal, focus, erro, read-only/disabled).
   - **Escala de resposta em radios 0–4 e 0–10** (o componente reutilizável): aspeto de cada botão, estado **selecionado vs não-selecionado**, foco e como as âncoras de texto são mostradas.
   - Grupos de opções (radios/checkboxes tipo "Grupo", "Preenchido por", "Sim/Não").
   - Cards / secções, cabeçalho de página, **barra de progresso**, alertas/mensagens de erro, links.
   - **Rodapé** com o "Powered by" + logótipo (posição, tamanho do logo, espaçamento).

5. **Layout & responsividade** — padding da página, largura máxima do conteúdo, ritmo vertical, e o que muda entre telemóvel e desktop.

6. **Ícones / assets** — biblioteca de ícones (se houver), e onde ficam o favicon e o logótipo.

**Formato de saída:** um único `STYLE_GUIDE.md`, com uma tabela de tokens no topo, blocos de código com o CSS/config **verbatim**, e valores concretos (nada de "aproximadamente"). No fim, escreve uma secção **"Como replicar noutra app"** com os passos mínimos (tokens a copiar primeiro, depois componentes).

Quando terminares, mostra-me o conteúdo completo do `STYLE_GUIDE.md`.
