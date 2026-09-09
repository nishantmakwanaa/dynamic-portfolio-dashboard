'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { Holding, SectorSummary } from '@/lib/types';

interface PortfolioTableProps {
  holdings: Holding[];
  currency: 'INR' | 'USD';
  usdRate?: number;
}

type SortField =
  | 'name'
  | 'purchasePrice'
  | 'quantity'
  | 'investment'
  | 'portfolioWeight'
  | 'cmp'
  | 'presentValue'
  | 'gainLoss'
  | 'peRatio'
  | 'eps';

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
  holdings,
  currency,
  usdRate = 0.012,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField>('investment');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatMoney = (amount: number) => {
    const val = currency === 'USD' ? amount * usdRate : amount;
    const symbol = currency === 'USD' ? '$' : '₹';
    return `${symbol}${val.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  };

  const totalPortfolioInvestment = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.purchasePrice * h.quantity, 0);
  }, [holdings]);

  const sectorsList = useMemo(() => {
    const set = new Set(holdings.map((h) => h.sector));
    return Array.from(set);
  }, [holdings]);

  const toggleSector = (sector: string) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [sector]: prev[sector] === undefined ? false : !prev[sector],
    }));
  };

  const filteredHoldings = useMemo(() => {
    return holdings.filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.sector.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = selectedSector === 'ALL' || h.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
  }, [holdings, searchTerm, selectedSector]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const groupedHoldings = useMemo(() => {
    const groups: Record<string, Holding[]> = {};

    filteredHoldings.forEach((h) => {
      if (!groups[h.sector]) groups[h.sector] = [];
      groups[h.sector].push(h);
    });

    Object.keys(groups).forEach((sec) => {
      groups[sec].sort((a, b) => {
        const invA = a.purchasePrice * a.quantity;
        const invB = b.purchasePrice * b.quantity;
        const cmpA = a.cmp || a.purchasePrice;
        const cmpB = b.cmp || b.purchasePrice;
        const pvA = cmpA * a.quantity;
        const pvB = cmpB * b.quantity;
        const glA = pvA - invA;
        const glB = pvB - invB;
        const weightA = totalPortfolioInvestment > 0 ? invA / totalPortfolioInvestment : 0;
        const weightB = totalPortfolioInvestment > 0 ? invB / totalPortfolioInvestment : 0;

        let valA: any;
        let valB: any;

        switch (sortField) {
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'purchasePrice':
            valA = a.purchasePrice;
            valB = b.purchasePrice;
            break;
          case 'quantity':
            valA = a.quantity;
            valB = b.quantity;
            break;
          case 'investment':
            valA = invA;
            valB = invB;
            break;
          case 'portfolioWeight':
            valA = weightA;
            valB = weightB;
            break;
          case 'cmp':
            valA = cmpA;
            valB = cmpB;
            break;
          case 'presentValue':
            valA = pvA;
            valB = pvB;
            break;
          case 'gainLoss':
            valA = glA;
            valB = glB;
            break;
          case 'peRatio':
            valA = typeof a.peRatio === 'number' ? a.peRatio : -999;
            valB = typeof b.peRatio === 'number' ? b.peRatio : -999;
            break;
          case 'eps':
            valA = typeof a.eps === 'number' ? a.eps : -999;
            valB = typeof b.eps === 'number' ? b.eps : -999;
            break;
          default:
            valA = invA;
            valB = invB;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    });

    return groups;
  }, [filteredHoldings, sortField, sortOrder, totalPortfolioInvestment]);

  const sectorSummaries = useMemo(() => {
    const summaries: Record<string, SectorSummary> = {};

    Object.entries(groupedHoldings).forEach(([sec, list]) => {
      let totalInv = 0;
      let totalPV = 0;

      list.forEach((h) => {
        const inv = h.purchasePrice * h.quantity;
        const cmp = h.cmp || h.purchasePrice;
        const pv = cmp * h.quantity;
        totalInv += inv;
        totalPV += pv;
      });

      const totalGL = totalPV - totalInv;
      const glPct = totalInv > 0 ? (totalGL / totalInv) * 100 : 0;
      const weight = totalPortfolioInvestment > 0 ? (totalInv / totalPortfolioInvestment) * 100 : 0;

      summaries[sec] = {
        sector: sec,
        totalInvestment: totalInv,
        totalPresentValue: totalPV,
        totalGainLoss: totalGL,
        gainLossPercentage: glPct,
        portfolioWeight: weight,
        holdingsCount: list.length,
      };
    });

    return summaries;
  }, [groupedHoldings, totalPortfolioInvestment]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stock or sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 text-xs sm:text-sm rounded-xl pl-10 pr-3 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">
                All Sectors ({holdings.length})
              </option>
              {sectorsList.map((sec) => (
                <option key={sec} value={sec} className="bg-slate-900">
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Stock Cards View (visible on small screens < md) */}
      <div className="block md:hidden p-3 space-y-3">
        {Object.keys(groupedHoldings).length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No stock holdings found.
          </div>
        ) : (
          Object.entries(groupedHoldings).map(([sector, list]) => {
            const isCollapsed = expandedSectors[sector] === false;
            const summary = sectorSummaries[sector];
            const isSecProfit = summary ? summary.totalGainLoss >= 0 : true;

            return (
              <div
                key={`mobile-sec-${sector}`}
                className="bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden shadow-lg"
              >
                {/* Sector Header Accordion */}
                <div
                  onClick={() => toggleSector(sector)}
                  className="p-3 bg-slate-800/90 flex items-center justify-between cursor-pointer border-b border-slate-700/80 active:bg-slate-800 transition"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-blue-400" />
                    )}
                    <div>
                      <h3 className="text-xs font-extrabold text-white">{sector}</h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {summary?.holdingsCount} stocks • {summary?.portfolioWeight.toFixed(1)}% Weight
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white font-mono">
                      {formatMoney(summary?.totalPresentValue || 0)}
                    </div>
                    <div
                      className={`text-[10px] font-bold font-mono ${
                        isSecProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isSecProfit ? '+' : ''}
                      {formatMoney(summary?.totalGainLoss || 0)} ({summary?.gainLossPercentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>

                {/* Stock Cards under Sector */}
                {!isCollapsed && (
                  <div className="p-2 space-y-2 divide-y divide-slate-800/60">
                    {list.map((h) => {
                      const investment = h.purchasePrice * h.quantity;
                      const cmp = h.cmp || h.purchasePrice;
                      const presentValue = cmp * h.quantity;
                      const gainLoss = presentValue - investment;
                      const gainLossPct = investment > 0 ? (gainLoss / investment) * 100 : 0;
                      const isGain = gainLoss >= 0;

                      return (
                        <div
                          key={`mobile-card-${h.id}`}
                          className="pt-2 first:pt-0 bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
                        >
                          {/* Stock Name & Symbol */}
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-white">{h.name}</h4>
                                <a
                                  href={`https://www.google.com/finance/quote/${h.googleSymbol}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-blue-400 font-mono font-bold flex items-center gap-0.5 hover:underline"
                                >
                                  {h.symbol}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium">
                                Qty: <strong className="text-slate-200">{h.quantity}</strong> @ {formatMoney(h.purchasePrice)}
                              </p>
                            </div>

                            {/* CMP Badge */}
                            <div className="text-right bg-blue-950/40 px-2 py-1 rounded-lg border border-blue-500/20">
                              <span className="text-[9px] uppercase tracking-wider text-blue-400 font-extrabold block">
                                CMP
                              </span>
                              <span className="text-xs font-bold text-blue-300 font-mono">
                                {formatMoney(cmp)}
                              </span>
                            </div>
                          </div>

                          {/* Financial Details Grid */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                            <div>
                              <span className="text-slate-400 block text-[9px]">Invested:</span>
                              <span className="font-mono font-bold text-slate-200">
                                {formatMoney(investment)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px]">Present Value:</span>
                              <span className="font-mono font-bold text-white">
                                {formatMoney(presentValue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px]">P/E:</span>
                              <span className="font-mono text-amber-300 font-bold">
                                {typeof h.peRatio === 'number' ? h.peRatio.toFixed(1) : h.peRatio ?? 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px]">EPS:</span>
                              <span className="font-mono text-amber-300 font-bold">
                                {typeof h.eps === 'number' ? h.eps.toFixed(1) : h.eps ?? 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Footer: Gain/Loss Chip */}
                          <div className="flex items-center justify-between pt-1">
                            <div
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono inline-flex items-center gap-1 ${
                                isGain
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {isGain ? '+' : ''}
                              {formatMoney(gainLoss)} ({isGain ? '+' : ''}
                              {gainLossPct.toFixed(2)}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Main Desktop Table (visible on screens >= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Stock Particulars</th>
              <th
                onClick={() => handleSort('purchasePrice')}
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Buy Price</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('quantity')}
                className="py-3.5 px-3 font-semibold text-center cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Qty</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('investment')}
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Investment</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('portfolioWeight')}
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Weight (%)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('cmp')}
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition text-blue-400"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CMP</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('presentValue')}
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Present Value</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('gainLoss')}
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Gain / Loss</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('peRatio')}
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition text-amber-400"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>P/E</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('eps')}
                className="py-3.5 px-3 font-semibold text-right cursor-pointer hover:text-white transition text-amber-400"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>EPS</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {Object.keys(groupedHoldings).length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No stock holdings found.
                </td>
              </tr>
            ) : (
              Object.entries(groupedHoldings).map(([sector, list]) => {
                const isCollapsed = expandedSectors[sector] === false;
                const summary = sectorSummaries[sector];
                const isSecProfit = summary ? summary.totalGainLoss >= 0 : true;

                return (
                  <React.Fragment key={sector}>
                    {/* Sector Summary Row */}
                    <tr
                      onClick={() => toggleSector(sector)}
                      className="bg-slate-800/90 hover:bg-slate-800 cursor-pointer border-t border-b border-slate-700/80 transition"
                    >
                      <td colSpan={3} className="py-3 px-4 font-bold text-slate-200">
                        <div className="flex items-center gap-2">
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-blue-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="text-sm font-semibold text-white">{sector}</span>
                          <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-normal">
                            {summary?.holdingsCount} stocks
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-200">
                        {formatMoney(summary?.totalInvestment || 0)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-300">
                        {summary?.portfolioWeight.toFixed(2)}%
                      </td>
                      <td className="py-3 px-3 text-right font-normal text-slate-400">—</td>
                      <td className="py-3 px-3 text-right font-semibold text-white">
                        {formatMoney(summary?.totalPresentValue || 0)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-xs inline-flex items-center justify-end gap-1 ${
                            isSecProfit
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isSecProfit ? '+' : ''}
                          {formatMoney(summary?.totalGainLoss || 0)} (
                          {summary?.gainLossPercentage.toFixed(2)}%)
                        </span>
                      </td>
                      <td colSpan={2} className="py-3 px-3 text-center text-slate-400 text-[11px]">
                        Sector Total
                      </td>
                    </tr>

                    {/* Stock Holdings Rows */}
                    {!isCollapsed &&
                      list.map((h) => {
                        const investment = h.purchasePrice * h.quantity;
                        const cmp = h.cmp || h.purchasePrice;
                        const presentValue = cmp * h.quantity;
                        const gainLoss = presentValue - investment;
                        const gainLossPct = investment > 0 ? (gainLoss / investment) * 100 : 0;
                        const weight =
                          totalPortfolioInvestment > 0
                            ? (investment / totalPortfolioInvestment) * 100
                            : 0;
                        const isGain = gainLoss >= 0;

                        return (
                          <tr
                            key={h.id}
                            className="hover:bg-slate-800/40 transition group border-b border-slate-800/40"
                          >
                            {/* Stock Name & Symbol */}
                            <td className="py-3 px-4 font-medium text-white">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{h.name}</span>
                                <a
                                  href={`https://www.google.com/finance/quote/${h.googleSymbol}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-0.5 text-[11px] font-mono text-blue-400 hover:underline"
                                >
                                  ({h.symbol})
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </a>
                              </div>
                            </td>

                            {/* Buy Price */}
                            <td className="py-3 px-3 text-right font-mono text-slate-300">
                              {formatMoney(h.purchasePrice)}
                            </td>

                            {/* Qty */}
                            <td className="py-3 px-3 text-center font-mono text-slate-300">
                              {h.quantity}
                            </td>

                            {/* Investment */}
                            <td className="py-3 px-3 text-right font-mono font-medium text-slate-200">
                              {formatMoney(investment)}
                            </td>

                            {/* Portfolio Weight % */}
                            <td className="py-3 px-3 text-right font-mono text-slate-400">
                              {weight.toFixed(2)}%
                            </td>

                            {/* CMP */}
                            <td className="py-3 px-3 text-right font-mono font-bold text-blue-300 bg-blue-950/20">
                              {formatMoney(cmp)}
                            </td>

                            {/* Present Value */}
                            <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                              {formatMoney(presentValue)}
                            </td>

                            {/* Gain / Loss */}
                            <td className="py-3 px-3 text-right font-mono font-semibold">
                              <div
                                className={`inline-flex flex-col items-end px-2 py-0.5 rounded text-xs ${
                                  isGain
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                <span>
                                  {isGain ? '+' : ''}
                                  {formatMoney(gainLoss)}
                                </span>
                                <span className="text-[10px] font-bold">
                                  ({isGain ? '+' : ''}
                                  {gainLossPct.toFixed(2)}%)
                                </span>
                              </div>
                            </td>

                            {/* P/E */}
                            <td className="py-3 px-3 text-right font-mono text-amber-300 bg-amber-950/10">
                              {typeof h.peRatio === 'number'
                                ? h.peRatio.toFixed(2)
                                : h.peRatio ?? 'N/A'}
                            </td>

                            {/* EPS */}
                            <td className="py-3 px-3 text-right font-mono text-amber-300 bg-amber-950/10">
                              {typeof h.eps === 'number'
                                ? h.eps.toFixed(2)
                                : h.eps ?? 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
