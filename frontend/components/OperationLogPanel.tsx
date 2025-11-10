"use client";

import { useMemo } from "react";
import { useOperationLog } from "@/hooks/useOperationLog";

export const OperationLogPanel = () => {
  const { entries, clear } = useOperationLog();

  const displayEntries = useMemo(() => entries.slice(0, 8), [entries]);

  return (
    <div className="rounded-2xl bg-base-100 border border-base-200 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Operation log</h3>
          <p className="text-xs text-base-content/60">Last {displayEntries.length} encrypted actions</p>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={clear} disabled={entries.length === 0}>
          Clear
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {displayEntries.length === 0 && (
          <div className="text-xs text-base-content/60">No operations yet. Run an encrypted job to populate the log.</div>
        )}
        {displayEntries.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-base-200 px-3 py-2 text-xs flex items-start gap-3">
            <span
              className={`badge badge-xs mt-0.5 ${
                entry.kind === "error"
                  ? "badge-error"
                  : entry.kind === "job"
                    ? "badge-primary"
                    : entry.kind === "rollback"
                      ? "badge-warning"
                      : entry.kind === "decrypt"
                        ? "badge-info"
                        : "badge-ghost"
              }`}
            />
            <div className="flex-1">
              <div className="font-medium text-base-content">{entry.title}</div>
              {entry.details && <p className="text-base-content/70">{entry.details}</p>}
              <p className="text-[10px] text-base-content/50 mt-1">
                {new Date(entry.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
