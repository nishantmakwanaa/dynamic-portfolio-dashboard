'use client';

import React from 'react';
import { Download, BarChart2 } from 'lucide-react';

interface DashboardHeaderProps {
  onExportCSV: () => void;
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onExportCSV,
  currency,
  setCurrency,
}) => {
  return (
    <header className="bg-slate-950/90 text-white px-4 py-4 sm:px-10 sticky top-0 z-30 backdrop-blur-md border-b border-slate-900">
      <div className="max-w-[1450px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Row 1: Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
            Dynamic Portfolio
          </h1>
        </div>

        {/* Under Row on Mobile / Inline Toolbar on Desktop */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-900 sm:border-t-0">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs sm:text-sm">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-extrabold transition ${
                currency === 'INR'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-extrabold transition ${
                currency === 'USD'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              $ USD
            </button>
          </div>

          {/* Direct Automatic CSV Download Button */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold shadow-lg shadow-blue-600/25 active:scale-95 transition border border-blue-400/30"
            title="Download CSV"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
