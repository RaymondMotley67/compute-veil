"use client";

import { useOperationLog } from "@/hooks/useOperationLog";
import type { UseFHEWorkflowResult } from "@/hooks/useFHEWorkflow";

type FHECounterPanelProps = {
  workflow: UseFHEWorkflowResult;
};

export const FHECounterPanel = ({ workflow }: FHECounterPanelProps) => {
  const { add: addLog } = useOperationLog();
  const { fheCounter, chainId, isConnected, fhevmStatus, fhevmError } = workflow;

  const hasCounter = fheCounter.isDeployed && fheCounter.contractAddress !== undefined;

  const guard = (condition: boolean | undefined, message: string): boolean => {
    const ok = Boolean(condition);
    if (!ok) {
      addLog({ kind: "error", title: message });
    }
    return ok;
  };

  const handleIncOrDec = (delta: number) => {
    if (!guard(fheCounter.canIncOrDec, "Encrypted counter not ready")) {
      return;
    }
    addLog({
      kind: delta > 0 ? "job" : "rollback",
      title: delta > 0 ? "Submitted encrypted job" : "Rolled back encrypted job",
      details: `Δ = ${delta}`,
    });
    fheCounter.incOrDec(delta);
  };

  const handleRefresh = () => {
    if (!guard(fheCounter.canGetCount, "Cannot refresh handle right now")) {
      return;
    }
    addLog({ kind: "info", title: "Refreshing encrypted handle" });
    fheCounter.refreshCountHandle();
  };

  const handleDecrypt = () => {
    if (!guard(fheCounter.canDecrypt, "Nothing to decrypt")) {
      return;
    }
    addLog({ kind: "decrypt", title: "Started local decryption" });
    fheCounter.decryptCountHandle();
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">
            Encrypted compute counter
          </h3>
          <p className="text-sm text-base-content/70">
            Each operation updates an encrypted counter on-chain. Decrypt the
            latest handle locally when you need to inspect the clear value.
          </p>
        </div>
        <span className="badge badge-outline text-xs">
          {chainId ? `Chain: ${chainId}` : "No network"}
        </span>
      </div>

      {!isConnected && (
        <div className="alert alert-info text-sm">
          <span>
            Connect your wallet using the button in the top-right corner to
            start running encrypted computations.
          </span>
        </div>
      )}

      {isConnected && !hasCounter && (
        <div className="alert alert-warning text-sm">
          <span>
            FHECounter is not deployed on the current network. Deploy the
            contract with Hardhat and refresh the page.
          </span>
        </div>
      )}

      {isConnected && hasCounter && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-base-content/60 uppercase tracking-wide">
                Encrypted handle
              </div>
              <div className="mockup-code text-xs bg-base-200">
                <pre className="whitespace-nowrap overflow-x-auto">
                  <code>{fheCounter.handle ?? "No handle yet"}</code>
                </pre>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-base-content/60 uppercase tracking-wide">
                Clear value
              </div>
              <div className="stats shadow-sm bg-base-200">
                <div className="stat">
                  <div className="stat-title text-xs">Decrypted count</div>
                  <div className="stat-value text-2xl">
                    {fheCounter.isDecrypted ? fheCounter.clear : "—"}
                  </div>
                  <div className="stat-desc text-xs">
                    Stored as encrypted euint32
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="btn btn-primary btn-block"
              disabled={!fheCounter.canIncOrDec}
              onClick={() => handleIncOrDec(+1)}
            >
              {fheCounter.isIncOrDec ? "Submitting job..." : "Run encrypted job"}
            </button>
            <button
              className="btn btn-outline btn-block"
              disabled={!fheCounter.canIncOrDec}
              onClick={() => handleIncOrDec(-1)}
            >
              {fheCounter.isIncOrDec ? "Reverting..." : "Rollback last job"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="btn btn-ghost btn-sm"
              disabled={!fheCounter.canGetCount}
              onClick={handleRefresh}
            >
              {fheCounter.isRefreshing ? "Refreshing handle..." : "Refresh handle"}
            </button>
            <button
              className="btn btn-ghost btn-sm justify-self-end"
              disabled={!fheCounter.canDecrypt}
              onClick={handleDecrypt}
            >
              {fheCounter.isDecrypting ? "Decrypting..." : "Decrypt locally"}
            </button>
          </div>
        </>
      )}

      <div className="divider my-3" />

      <div className="space-y-1">
        <div className="text-xs text-base-content/60 uppercase tracking-wide">
          Status
        </div>
        <p className="text-xs text-base-content/80 min-h-[1.5rem]">
          {fheCounter.message ||
            (fhevmStatus === "loading"
              ? "Preparing FHE runtime..."
              : fhevmStatus === "error"
                ? `FHEVM error: ${fhevmError?.message ?? "Unknown error"}`
                : "Ready to receive encrypted workloads.")}
        </p>
      </div>
    </div>
  );
};

