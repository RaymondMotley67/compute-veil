"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type OperationLogKind = "job" | "rollback" | "decrypt" | "refresh" | "info" | "error";

export type OperationLogEntry = {
  id: string;
  ts: number;
  kind: OperationLogKind;
  title: string;
  details?: string;
};

interface OperationLogContextValue {
  entries: OperationLogEntry[];
  add: (entry: Omit<OperationLogEntry, "id" | "ts"> & { ts?: number }) => void;
  clear: () => void;
}

const OperationLogContext = createContext<OperationLogContextValue | undefined>(undefined);

export const OperationLogProvider = ({ children }: { children: React.ReactNode }) => {
  const [entries, setEntries] = useState<OperationLogEntry[]>([]);

  const add = useCallback(
    (entry: Omit<OperationLogEntry, "id" | "ts"> & { ts?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const ts = entry.ts ?? Date.now();
      setEntries((prev) => [{ id, ts, kind: entry.kind, title: entry.title, details: entry.details }, ...prev].slice(0, 50));
    },
    []
  );

  const clear = useCallback(() => setEntries([]), []);

  const value = useMemo(() => ({ entries, add, clear }), [entries, add, clear]);

  return <OperationLogContext.Provider value={value}>{children}</OperationLogContext.Provider>;
};

export const useOperationLog = () => {
  const ctx = useContext(OperationLogContext);
  if (!ctx) {
    throw new Error("useOperationLog must be used within an OperationLogProvider");
  }
  return ctx;
};
