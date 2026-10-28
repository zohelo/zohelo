import React from 'react';
import { FileSpreadsheet, Layers, BarChart, FileText, Download, Eye, Table2 } from 'lucide-react';
import { vaultDatasets } from '../data/datasetsData';
import { DatasetItem } from '../types';
import { IllustrativeBadge } from './IllustrativeBadge';

interface VaultSectionProps {
  onPreviewDataset: (dataset: DatasetItem) => void;
}

export const VaultSection: React.FC<VaultSectionProps> = ({
  onPreviewDataset
}) => {
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'CSV':
        return (
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-mono-code font-bold text-xs">
            CSV
          </div>
        );
      case 'Parquet':
        return (
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 text-[#3A6FA4] flex items-center justify-center font-mono-code font-bold text-xs">
            <Layers className="w-5 h-5" />
          </div>
        );
      case 'Power BI':
        return (
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-mono-code font-bold text-xs">
            <BarChart className="w-5 h-5" />
          </div>
        );
      case 'PDF':
        return (
          <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-center font-mono-code font-bold text-xs">
            PDF
          </div>
        );
      default:
        return <FileSpreadsheet className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <section id="vault" className="w-full pt-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching Mockup: "THE VAULT" */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500">
                The Vault
              </h2>
              <IllustrativeBadge />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Open Lakehouse Artifacts • 5TB Parquet Storage (The Cabinet)
            </p>
          </div>
          <div className="text-xs text-[#3B8B94] font-medium hidden sm:block">
            DuckDB & Snappy Compressed
          </div>
        </div>

        {/* 4-Card Grid matching the exact Mockup layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {vaultDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className="zohelo-card p-5 flex flex-col justify-between group"
            >
              <div
                onClick={() => onPreviewDataset(dataset)}
                className="cursor-pointer"
              >
                {/* Top Icon Badge */}
                <div className="mb-4">
                  {getFormatIcon(dataset.format)}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#3B8B94] transition-colors leading-snug">
                  {dataset.title}
                </h3>

                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                  {dataset.description}
                </p>

                <div className="mt-2 text-[10px] font-mono-code text-slate-400">
                  {dataset.size} • {dataset.recordsCount}
                </div>
              </div>

              {/* Bottom Row matching Mockup: Format text on left, Download icon in circle on right */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onPreviewDataset(dataset)}
                  className="text-xs font-bold text-slate-700 hover:text-[#3B8B94] transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>{dataset.format}</span>
                  <Table2 className="w-3 h-3 text-slate-400 ml-1" />
                </button>

                {/* No downloads until the data release */}
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Available with the data release</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
