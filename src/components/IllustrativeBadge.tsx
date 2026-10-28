import { AlertCircle } from 'lucide-react';

/** Marks a section whose numbers, articles or datasets are samples, not real data. */
export function IllustrativeBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 font-mono"
      title="Sample data. Real figures arrive with the data release."
    >
      <AlertCircle className="w-2.5 h-2.5 mr-1 text-amber-600" aria-hidden="true" />
      Illustrative values
    </span>
  );
}
