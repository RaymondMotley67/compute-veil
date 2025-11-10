"use client";

export type DatasetCard = {
  id: number;
  name: string;
  description: string;
  size: string;
  difficulty: "Low" | "Medium" | "High";
  delta: number;
  category: string;
  latency: string;
  featured?: boolean;
};

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
    featured: true,
  },
];

type DatasetGridProps = {
  datasets: DatasetCard[];
  disabled?: boolean;
  busyId?: number | null;
  onRunDataset: (dataset: DatasetCard) => void;
};

export const DatasetGrid = ({ datasets, disabled, busyId, onRunDataset }: DatasetGridProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {datasets.map((dataset) => {
        const isBusy = busyId === dataset.id;
        return (
          <div
            key={dataset.id}
            className="card bg-base-100 border border-base-200 hover:shadow-lg transition-shadow"
          >
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="card-title text-base">{dataset.name}</h3>
                  <p className="text-xs text-base-content/60">{dataset.category}</p>
                </div>
                <span
                  className={`badge h-7 px-3 text-xs ${
                    dataset.difficulty === "High"
                      ? "badge-error"
                      : dataset.difficulty === "Medium"
                        ? "badge-warning"
                        : "badge-success"
                  } badge-outline`}
                >
                  {dataset.difficulty}
                </span>
              </div>

              <p className="text-sm text-base-content/70 min-h-[3.5rem]">{dataset.description}</p>

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-base-200/70">
                  <dt className="text-base-content/60">Encrypted batch</dt>
                  <dd className="text-base font-semibold">{dataset.size}</dd>
                </div>
                <div className="p-3 rounded-lg bg-base-200/70">
                  <dt className="text-base-content/60">Expected latency</dt>
                  <dd className="text-base font-semibold">{dataset.latency}</dd>
                </div>
              </dl>

              <div className="card-actions justify-between items-center pt-2">
                <span className="text-xs text-base-content/60">
                  Δ encrypted counter: {dataset.delta > 0 ? `+${dataset.delta}` : dataset.delta}
                </span>
                <button
                  className="btn btn-sm btn-primary"
                  disabled={disabled || isBusy}
                  onClick={() => onRunDataset(dataset)}
                >
                  {isBusy ? "Submitting..." : "Run encrypted job"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

