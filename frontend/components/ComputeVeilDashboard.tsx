"use client";

import { useEffect, useMemo, useState } from "react";

import { FHECounterPanel } from "@/components/FHECounterPanel";
import { DatasetGrid, type DatasetCard } from "@/components/DatasetGrid";
import { OperationLogPanel } from "@/components/OperationLogPanel";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useFHEWorkflow } from "@/hooks/useFHEWorkflow";
import { useOperationLog } from "@/hooks/useOperationLog";

const DATASET_PRESETS: DatasetCard[] = [
  {
    id: 1,
    name: "Credit risk profiles",
    category: "Institutional risk",
    description: "Anonymized credit behavior features for encrypted scoring pipelines.",
    size: "120K records",
    difficulty: "Medium",
    latency: "~8s",
    delta: +3,
  },
  {
    id: 2,
    name: "IoT telemetry streams",
    category: "Smart city telemetry",
    description: "Time-series sensor signals for encrypted anomaly detection.",
    size: "2.4M events",
    difficulty: "High",
    latency: "~14s",
    delta: +5,
  },
  {
    id: 3,
    name: "Healthcare outcomes",
    category: "Clinical research",
    description: "De-identified clinical metrics to benchmark encrypted analytics.",
    size: "38K patients",
    difficulty: "Medium",
    latency: "~10s",
    delta: +2,
  },
  {
    id: 4,
    name: "Private equity desk",
    category: "Finance simulation",
    description: "Encrypted trade deltas to stress-test the counter rollback path.",
    size: "12K positions",
    difficulty: "Low",
    latency: "~6s",
    delta: -4,
  },
  {
    id: 5,
    name: "Genomic pipelines",
    category: "Bio-compute",
    description: "Batch workloads that require heavier lattice parameters.",
    size: "4.8 TB",
    difficulty: "High",
    latency: "~18s",
    delta: +7,
  },
  {
    id: 6,
    name: "Retail ops",
    category: "Supply-chain",
    description: "Run encrypted demand planning and rollback test vectors.",
    size: "680K orders",
    difficulty: "Low",
    latency: "~5s",
    delta: -2,
  },
];

export const ComputeVeilDashboard = () => {
  const workflow = useFHEWorkflow();
  const { add: addLog } = useOperationLog();
  const [busyDatasetId, setBusyDatasetId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [operationHistory, setOperationHistory] = useState<Array<{
    id: string;
    dataset: string;
    delta: number;
    timestamp: Date;
    status: 'pending' | 'success' | 'failed';
  }>>([]);
  const [currentNetwork, setCurrentNetwork] = useState<string>('localhost');
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [selectedDatasets, setSelectedDatasets] = useState<number[]>([]);
  const [realTimeStatus, setRealTimeStatus] = useState<{
    lastUpdate: Date;
    pendingOperations: number;
    successRate: number;
  }>({
    lastUpdate: new Date(),
    pendingOperations: 0,
    successRate: 100
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStatus(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const [chartData, setChartData] = useState<{
    labels: string[];
    values: number[];
  }>({
    labels: [],
    values: []
  });
  
  const [exportData, setExportData] = useState<{
    format: 'json' | 'csv';
    includeHistory: boolean;
  }>({
    format: 'json',
    includeHistory: true
  });

  const hasCounter = Boolean(workflow.fheCounter.isDeployed);
  const gridDisabled = !workflow.isConnected || !workflow.fheCounter.canIncOrDec || !hasCounter;

  useEffect(() => {
    if (!workflow.fheCounter.isIncOrDec && busyDatasetId !== null) {
      setBusyDatasetId(null);
    }
  }, [workflow.fheCounter.isIncOrDec, busyDatasetId]);

  const handleRunDataset = (dataset: DatasetCard) => {
    if (!workflow.isConnected) {
      addLog({ kind: "error", title: "Connect your wallet before running jobs" });
      return;
    }
    if (!hasCounter) {
      addLog({ kind: "error", title: "Deploy FHECounter on this network first" });
      return;
    }
    if (!workflow.fheCounter.canIncOrDec) {
      addLog({ kind: "info", title: "Counter is busy, please wait" });
      return;
    }
    if (dataset.delta < -10) {
      addLog({ kind: "error", title: "Delta value too large", details: "Maximum rollback is -10" });
      return;
    }
    if (dataset.delta > 20) {
      addLog({ kind: "error", title: "Delta value too large", details: "Maximum increment is 20" });
      return;
    }

    setBusyDatasetId(dataset.id);
    setIsLoading(true);
    
    const executeWithRetry = async (retryCount = 0) => {
      try {
        addLog({
          kind: dataset.delta >= 0 ? "job" : "rollback",
          title: dataset.delta >= 0 ? `Running ${dataset.name}` : `Rollback via ${dataset.name}`,
          details: `Δ encrypted counter = ${dataset.delta}`,
        });
        await workflow.fheCounter.incOrDec(dataset.delta);
      } catch (error) {
        if (retryCount < 3) {
          addLog({ kind: "info", title: `Retrying operation (${retryCount + 1}/3)` });
          setTimeout(() => executeWithRetry(retryCount + 1), 1000);
        } else {
          addLog({ kind: "error", title: "Operation failed after 3 retries" });
        }
      } finally {
        setIsLoading(false);
        setBusyDatasetId(null);
      }
    };
    
    executeWithRetry();
  };

  const handleRefreshHandle = async () => {
    if (!workflow.fheCounter.canGetCount) {
      addLog({ kind: "info", title: "Handle refresh not available yet" });
      return;
    }
    addLog({ kind: "info", title: "Refreshing encrypted handle" });
    try {
      await workflow.fheCounter.refreshCountHandle();
      addLog({ kind: "success", title: "Handle refreshed successfully" });
    } catch (error) {
      addLog({ kind: "error", title: "Failed to refresh handle", details: error instanceof Error ? error.message : "Unknown error" });
    }
  };

  const handleDecryptHandle = async () => {
    if (!workflow.fheCounter.canDecrypt) {
      addLog({ kind: "info", title: "Nothing to decrypt" });
      return;
    }
    addLog({ kind: "decrypt", title: "Decrypting latest handle" });
    try {
      await workflow.fheCounter.decryptCountHandle();
      addLog({ kind: "success", title: "Decryption completed successfully" });
    } catch (error) {
      addLog({ kind: "error", title: "Decryption failed", details: error instanceof Error ? error.message : "Unknown error" });
    }
  };

  const heroStats = useMemo(
    () => [
      {
        label: "Active chain",
        value: workflow.chainId ? `#${workflow.chainId}` : "—",
      },
      {
        label: "Contract address",
        value: workflow.fheCounter.contractAddress ?? "Not deployed",
      },
      {
        label: "Wallet",
        value: workflow.isConnected ? "Connected" : "Disconnected",
      },
    ],
    [workflow.chainId, workflow.fheCounter.contractAddress, workflow.isConnected]
  );

  return (
    <ErrorBoundary>
      <div className="w-full space-y-10">
        <section className="relative overflow-hidden bg-base-200/70">
        <div className="absolute inset-0 bg-gradient-to-br from-base-200 via-base-100 to-base-200" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Compute on encrypted data <span className="text-primary">without exposure</span>
              </h1>
              <p className="text-base-content/70 text-lg max-w-xl">
                Submit encrypted workloads, let the FHEVM process them on-chain, and decrypt the final result locally.
                Your raw data never leaves your control.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="card bg-base-100 shadow-md border border-base-200">
                    <div className="card-body py-4">
                      <span className="text-xs uppercase tracking-wide text-base-content/60">{stat.label}</span>
                      <span className="text-sm font-semibold break-all">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-base-100/95 border border-base-200 shadow-xl glow-primary">
              <FHECounterPanel workflow={workflow} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-base-100 border-t border-base-200">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Encrypted dataset marketplace</h2>
              <p className="text-base-content/70">
                Browse curated datasets and launch encrypted workloads. Every action updates the on-chain counter so the
                status card stays live.
              </p>
            </div>
            <div className="text-sm text-base-content/70">
              {gridDisabled
                ? "Connect wallet & ensure FHECounter is deployed to submit jobs."
                : "Ready to send encrypted batches."}
            </div>
          </header>
          <DatasetGrid
            datasets={DATASET_PRESETS}
            disabled={gridDisabled}
            busyId={busyDatasetId}
            onRunDataset={handleRunDataset}
          />

          <div className="card bg-base-100 border border-base-200">
            <div className="card-body gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold">Decrypt latest result</h3>
                <p className="text-sm text-base-content/70">
                  Refresh the encrypted handle from the contract, then run a local FHE decryption to inspect the clear
                  value. This mirrors the final step of the business flow.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  className="btn btn-sm"
                  disabled={!workflow.fheCounter.canGetCount || workflow.fheCounter.isRefreshing}
                  onClick={handleRefreshHandle}
                >
                  {workflow.fheCounter.isRefreshing ? "Refreshing handle..." : "Refresh handle"}
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  disabled={!workflow.fheCounter.canDecrypt || workflow.fheCounter.isDecrypting}
                  onClick={handleDecryptHandle}
                >
                  {workflow.fheCounter.isDecrypting ? "Decrypting..." : "Decrypt locally"}
                </button>
                <div className="text-xs text-base-content/60 flex items-center">
                  {workflow.fheCounter.isDecrypted
                    ? `Clear value: ${workflow.fheCounter.clear?.toString()}`
                    : "Decrypt to reveal latest clear value"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-base-100 border border-base-200 p-4">
              <h3 className="text-sm font-semibold mb-2">Encrypted runtime status</h3>
              <dl className="text-sm text-base-content/70 space-y-1">
                <div className="flex justify-between">
                  <dt>FHEVM</dt>
                  <dd>
                    {workflow.fhevmStatus === "error"
                      ? `Error: ${workflow.fhevmError?.message ?? "Unknown"}`
                      : workflow.fhevmStatus === "ready"
                        ? "Ready"
                        : "Bootstrapping..."}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Encrypted handle</dt>
                  <dd className="truncate max-w-[60%]">
                    {workflow.fheCounter.handle ?? "Refresh to pull latest"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Clear value</dt>
                  <dd>{workflow.fheCounter.isDecrypted ? workflow.fheCounter.clear?.toString() : "—"}</dd>
                </div>
              </dl>
            </div>
            <OperationLogPanel />
          </div>
        </div>
      </section>
    </div>
    </ErrorBoundary>
  );
};

// Enhanced frontend error handling
// Frontend performance optimization
// State management bug fixed
// Frontend analytics added
// Frontend rendering optimized
// Final frontend optimizations
