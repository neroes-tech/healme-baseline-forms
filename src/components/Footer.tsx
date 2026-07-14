// src/components/Footer.tsx
// Rodapé "Powered by" + logótipo Neroes (asset real em public/logo.png).
// O logo mantém as cores vivas — sempre sobre fundo claro, nunca sobre --brand.

export default function Footer() {
  return (
    <footer className="mx-auto mt-12 w-full max-w-content border-t border-line px-4 py-8 text-center">
      <a
        href="https://neroes.tech"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Neroes"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-[0.8125rem] text-muted transition hover:text-ink"
      >
        <span>Powered by</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Neroes" width={68} height={28} className="h-7 w-auto" />
      </a>
      <p className="mt-2 text-[0.75rem] text-muted">HE26 · Dados codificados por ID</p>
    </footer>
  );
}
