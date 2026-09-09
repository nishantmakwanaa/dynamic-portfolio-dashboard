'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Holding } from '@/lib/types';

interface PortfolioChartsProps {
  holdings: Holding[];
  currency: 'INR' | 'USD';
  usdRate?: number;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({
  holdings,
  currency,
  usdRate = 0.012,
}) => {
  const formatValue = (amount: number) => {
    const val = currency === 'USD' ? amount * usdRate : amount;
    const symbol = currency === 'USD' ? '$' : '₹';
    return `${symbol}${Math.round(val).toLocaleString()}`;
  };

  // 1. Sector Allocation Data
  const sectorData = React.useMemo(() => {
    const map: Record<string, number> = {};
    holdings.forEach((h) => {
      const inv = h.purchasePrice * h.quantity;
      map[h.sector] = (map[h.sector] || 0) + inv;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [holdings]);

  // 2. Sector Performance Data (Investment vs Present Value)
  const sectorPerformanceData = React.useMemo(() => {
    const map: Record<string, { investment: number; presentValue: number }> = {};
    holdings.forEach((h) => {
      const inv = h.purchasePrice * h.quantity;
      const cmp = h.cmp || h.purchasePrice;
      const pv = cmp * h.quantity;
      if (!map[h.sector]) {
        map[h.sector] = { investment: 0, presentValue: 0 };
      }
      map[h.sector].investment += inv;
      map[h.sector].presentValue += pv;
    });

    return Object.entries(map).map(([sector, val]) => ({
      sector,
      Investment: Math.round(currency === 'USD' ? val.investment * usdRate : val.investment),
      'Present Value': Math.round(
        currency === 'USD' ? val.presentValue * usdRate : val.presentValue
      ),
      GainLoss: Math.round(
        currency === 'USD'
          ? (val.presentValue - val.investment) * usdRate
          : val.presentValue - val.investment
      ),
    }));
  }, [holdings, currency, usdRate]);

  // 3. Top Gainers and Losers
  const holdingPerformanceData = React.useMemo(() => {
    const sorted = [...holdings]
      .map((h) => {
        const inv = h.purchasePrice * h.quantity;
        const cmp = h.cmp || h.purchasePrice;
        const pv = cmp * h.quantity;
        const gl = pv - inv;
        const glPct = inv > 0 ? (gl / inv) * 100 : 0;
        return {
          name: h.name,
          symbol: h.symbol,
          gainLossPct: Number(glPct.toFixed(2)),
          gainLossVal: currency === 'USD' ? gl * usdRate : gl,
        };
      })
      .sort((a, b) => b.gainLossPct - a.gainLossPct);

    // Top 5 and Bottom 5
    const top = sorted.slice(0, 5);
    const bottom = sorted.slice(-5).reverse();
    return [...top, ...bottom];
  }, [holdings, currency, usdRate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-10">
      {/* Sector Allocation Donut Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <h3 className="text-xl font-black text-white font-sans">Sector Allocation</h3>
        </div>
        <div className="h-88 sm:h-96 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={115}
                paddingAngle={6}
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [formatValue(Number(val)), 'Investment']}
                contentStyle={{
                  backgroundColor: '#0b0f17',
                  borderColor: '#334155',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                formatter={(value) => <span className="text-xs font-bold text-slate-300">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Performance Comparison Bar Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl flex flex-col justify-between hover:border-slate-700 transition">
        <div>
          <h3 className="text-xl font-black text-white font-sans">Sector Performance</h3>
        </div>
        <div className="h-88 sm:h-96 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorPerformanceData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis
                dataKey="sector"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(value: any) => [
                  `${currency === 'USD' ? '$' : '₹'}${Number(value).toLocaleString()}`,
                ]}
                contentStyle={{
                  backgroundColor: '#0b0f17',
                  borderColor: '#334155',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              />
              <Legend verticalAlign="top" height={40} />
              <Bar dataKey="Investment" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Present Value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
