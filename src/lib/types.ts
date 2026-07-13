// src/lib/types.ts
// Tipos partilhados da aplicação.

export type StudyGroup = "active" | "vacation" | "waitlist";
export type FilledBy = "participante" | "operador";

export type Participant = {
  id: string;
  polar_id: string;
  display_name: string;
  email: string;
  polar_band_serial: string | null;
  study_group: StudyGroup | null;
  created_at: string;
};

export type FormSession = {
  id: string;
  participant_id: string;
  polar_id: string;
  timepoint: string;
  started_at: string;
  completed_at: string | null;
  status: "in_progress" | "completed";
};

// Valores comuns do bloco de identificação (partilhados pelos dois formulários).
export type IdentificationValues = {
  polarId: string; // read-only, do perfil
  formDate: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:MM'
  studyGroup: StudyGroup | null; // só HEAL-ME
  timepoint: string; // read-only 'Baseline'
  language: string; // read-only 'Português'
  filledBy: FilledBy; // obrigatório
  formVersion: string; // read-only 'v1.0' (só HEAL-ME)
};
