"use client";

// src/lib/useDraft.ts
// Rascunhos: guarda as respostas em curso em localStorage, com chave por session_id.
// Restaura no reload; limpa após submissão com sucesso.
import { useCallback, useEffect, useRef, useState } from "react";

export function useDraft<T extends object>(
  storageKey: string,
  initial: T,
): {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  clearDraft: () => void;
  restored: boolean;
} {
  const [data, setData] = useState<T>(initial);
  const [restored, setRestored] = useState(false);
  const hydrated = useRef(false);

  // Restaurar do localStorage no arranque.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<T>;
        setData((prev) => ({ ...prev, ...parsed }));
        setRestored(true);
      }
    } catch {
      // localStorage indisponível ou JSON inválido — ignora e usa o inicial.
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Persistir a cada alteração (só depois de hidratar, para não escrever o inicial por cima).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // Sem espaço / modo privado — ignora silenciosamente.
    }
  }, [storageKey, data]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignora
    }
  }, [storageKey]);

  return { data, setData, clearDraft, restored };
}
