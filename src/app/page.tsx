'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SummaryCards } from '@/components/SummaryCards';
import { PortfolioTable } from '@/components/PortfolioTable';
import { PortfolioCharts } from '@/components/PortfolioCharts';
import { ErrorDisclaimerBanner } from '@/components/ErrorDisclaimerBanner';
import { Holding, PortfolioTotals } from '@/lib/types';
import { INITIAL_HOLDINGS } from '@/lib/initialData';
import { exportToCSV } from '@/lib/exportUtils';
import { Heart } from 'lucide-react';

export default function DashboardPage() {
  const [holdings, setHoldings] = useState<Holding[]>(INITIAL_HOLDINGS);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch holdings from API
  const fetchPortfolio = useCallback(async (fetchLive = false) => {
    setErrorMsg(null);
    try {
      const url = fetchLive ? '/api/portfolio?live=true' : '/api/portfolio';
      const res = await fetch(url);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setHoldings(json.data);
      } else {
        setErrorMsg(json.error || 'Failed to load portfolio holdings');
      }
    } catch {
      setErrorMsg('Network error fetching live stock data.');
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPortfolio(true);
  }, [fetchPortfolio]);

  // 15-second interval timer for live auto-refresh background sync
  useEffect(() => {
    const timer = setInterval(() => {
      fetchPortfolio(true);
    }, 15000);

    return () => clearInterval(timer);
  }, [fetchPortfolio]);

  // Handle direct automatic CSV export
  const handleExportCSV = () => {
    exportToCSV(holdings, `portfolio_holdings_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Calculate Overall Portfolio Totals
  const totals: PortfolioTotals = useMemo(() => {
    let totalInv = 0;
    let totalPV = 0;
    let topGainer: Holding | null = null;
    let worstPerformer: Holding | null = null;
    let maxGainPct = -Infinity;
    let minGainPct = Infinity;

    holdings.forEach((h) => {
      const inv = h.purchasePrice * h.quantity;
      const cmp = h.cmp || h.purchasePrice;
      const pv = cmp * h.quantity;
      totalInv += inv;
      totalPV += pv;

      const glPct = inv > 0 ? ((pv - inv) / inv) * 100 : 0;
      if (glPct > maxGainPct) {
        maxGainPct = glPct;
        topGainer = h;
      }
      if (glPct < minGainPct) {
        minGainPct = glPct;
        worstPerformer = h;
      }
    });

    const totalGL = totalPV - totalInv;
    const glPct = totalInv > 0 ? (totalGL / totalInv) * 100 : 0;

    return {
      totalInvestment: totalInv,
      totalPresentValue: totalPV,
      totalGainLoss: totalGL,
      gainLossPercentage: glPct,
      topGainer,
      worstPerformer,
    };
  }, [holdings]);

  const hasStaleHoldings = holdings.some((h) => h.isStale);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Top Navigation Header */}
      <DashboardHeader
        onExportCSV={handleExportCSV}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1450px] w-full mx-auto px-4 py-6 sm:px-8 sm:py-8 space-y-8">
        {/* Status / Error Disclaimer Banner */}
        <ErrorDisclaimerBanner isStaleData={hasStaleHoldings} errorMsg={errorMsg} />

        {/* Symmetrical Top Summary Cards */}
        <div>
          <SummaryCards totals={totals} currency={currency} />
        </div>

        {/* Visual Analytics & Charts */}
        <div>
          <PortfolioCharts holdings={holdings} currency={currency} />
        </div>

        {/* Main Sector-Grouped Holdings Table / Mobile Stock List */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">Holdings & Sectors</h2>
            <span className="text-xs sm:text-sm text-slate-200 font-mono bg-slate-900 px-3.5 py-1.5 rounded-2xl border border-slate-800 shadow-inner font-black">
              Holdings: <strong className="text-white">{holdings.length}</strong>
            </span>
          </div>

          <PortfolioTable
            holdings={holdings}
            currency={currency}
          />
        </div>
      </main>

      {/* Integrated Single Page Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-sm text-slate-400">
        <div className="max-w-[1450px] mx-auto px-4 flex items-center justify-center gap-2 text-slate-300 font-extrabold text-sm sm:text-base">
          <span>Made With</span>
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500 inline-block animate-pulse" />
          <span>By Nishant Makwana</span>
        </div>
      </footer>
    </div>
  );
}
