import { Holding } from './types';

export function exportToCSV(holdings: Holding[], filename = 'portfolio_export.csv') {
  const headers = [
    'Particulars',
    'NSE/BSE Symbol',
    'Sector',
    'Purchase Price (INR)',
    'Quantity',
    'Investment (INR)',
    'CMP (INR)',
    'Present Value (INR)',
    'Gain/Loss (INR)',
    'Gain/Loss (%)',
    'P/E Ratio',
    'Latest Earnings (EPS)',
  ];

  const totalInvestment = holdings.reduce((sum, h) => sum + h.purchasePrice * h.quantity, 0);

  const rows = holdings.map((h) => {
    const investment = h.purchasePrice * h.quantity;
    const cmp = h.cmp || h.purchasePrice;
    const presentValue = cmp * h.quantity;
    const gainLoss = presentValue - investment;
    const gainLossPct = investment > 0 ? ((gainLoss / investment) * 100).toFixed(2) : '0.00';

    return [
      `"${h.name}"`,
      `"${h.symbol}"`,
      `"${h.sector}"`,
      h.purchasePrice,
      h.quantity,
      investment.toFixed(2),
      cmp.toFixed(2),
      presentValue.toFixed(2),
      gainLoss.toFixed(2),
      `"${gainLossPct}%"`,
      `"${h.peRatio ?? 'N/A'}"`,
      `"${h.eps ?? 'N/A'}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(holdings: Holding[], filename = 'portfolio_export.json') {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(holdings, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
