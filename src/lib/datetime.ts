// src/lib/datetime.ts
// Fusos horários: guardamos sempre timestamptz (UTC) na BD.
// Mostramos/pré-preenchemos Data/Hora num fuso configurável via NEXT_PUBLIC_STUDY_TIMEZONE.
// (O estudo é no Egito — default Europe/Lisbon, trocável para Africa/Cairo sem mexer no código.)

export const STUDY_TIMEZONE =
  process.env.NEXT_PUBLIC_STUDY_TIMEZONE || "Europe/Lisbon";

// 'YYYY-MM-DD' no fuso do estudo (para <input type="date">).
export function todayInStudyTz(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDY_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts; // en-CA dá 'YYYY-MM-DD'
}

// 'HH:MM' no fuso do estudo (para <input type="time">).
export function nowTimeInStudyTz(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: STUDY_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

// Formata um timestamptz (UTC) para leitura humana no fuso do estudo.
export function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: STUDY_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}
