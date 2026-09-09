'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PortfolioTotals } from '@/lib/types';

interface SummaryCardsProps {
  totals: PortfolioTotals;
  currency: 'INR' | 'USD';
  usdRate?: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totals,
  currency,
  usdRate = 0.012,
}) => {
  const formatMoney = (amount: number) => {
    const val = currency === 'USD' ? amount * usdRate : amount;
    const symbol = currency === 'USD' ? '$' : '₹';
    return `${symbol}${val.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  };

  const isProfit = totals.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-6 sm:my-8">
      {/* CARD 1: Net Valuation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black tracking-wider text-blue-400 uppercase font-mono truncate">
            Net Valuation
          </span>
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 min-w-0 overflow-hidden">
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono tabular-nums truncate"
            title={formatMoney(totals.totalPresentValue)}
          >
            {formatMoney(totals.totalPresentValue)}
          </h2>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`px-2.5 py-0.5 rounded-full inline-flex items-center gap-0.5 text-xs font-extrabold shrink-0 ${
                isProfit
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {isProfit ? '+' : ''}
              {totals.gainLossPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* CARD 2: Capital Invested */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black tracking-wider text-purple-400 uppercase font-mono truncate">
            Capital Invested
          </span>
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 min-w-0 overflow-hidden">
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-mono tabular-nums truncate"
            title={formatMoney(totals.totalInvestment)}
          >
            {formatMoney(totals.totalInvestment)}
          </h2>
        </div>
      </div>

      {/* CARD 3: Total Return */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black tracking-wider text-slate-400 uppercase font-mono truncate">
            Total Return
          </span>
          <div
            className={`p-2 rounded-2xl border shrink-0 ${
              isProfit ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>
        <div className="mt-2 min-w-0 overflow-hidden">
          <h2
            className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight font-mono tabular-nums truncate ${
              isProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
            title={formatMoney(totals.totalGainLoss)}
          >
            {isProfit ? '+' : ''}
            {formatMoney(totals.totalGainLoss)}
          </h2>
        </div>
      </div>

      {/* CARD 4: Top Gainer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black tracking-wider text-emerald-400 uppercase font-mono truncate">
            Top Gainer
          </span>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 min-w-0 overflow-hidden">
          {totals.topGainer ? (
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white font-sans truncate" title={totals.topGainer.name}>
                {totals.topGainer.name}
              </h3>
              <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono mt-1 truncate">
                +
                {(
                  (((totals.topGainer.cmp || totals.topGainer.purchasePrice) -
                    totals.topGainer.purchasePrice) /
                    totals.topGainer.purchasePrice) *
                  100
                ).toFixed(2)}
                %
              </div>
            </div>
          ) : (
            <span className="text-sm text-slate-400 font-medium">N/A</span>
          )}
        </div>
      </div>
    </div>
  );
};
