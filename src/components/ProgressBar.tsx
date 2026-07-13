// src/components/ProgressBar.tsx
// Barra de progresso ("Formulário 1 de 2" / "Formulário 2 de 2").

type Props = {
  current: number; // 1-based
  total: number;
  label: string;
};

export default function ProgressBar({ current, total, label }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
        <span>{label}</span>
        <span>
          Formulário {current} de {total}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
