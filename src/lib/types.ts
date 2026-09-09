export interface Holding {
  id: string;
  symbol: string;         // Stock Exchange Code (e.g. HDFCBANK, 532174)
  name: string;           // Particulars (e.g. HDFC Bank)
  sector: string;         // Sector (e.g. Financial Sector, Tech Sector)
  purchasePrice: number;  // Purchase price per unit
  quantity: number;       // Quantity held
  yahooSymbol: string;    // Ticker symbol for Yahoo Finance API (e.g. HDFCBANK.NS)
  googleSymbol: string;   // Ticker query for Google Finance (e.g. HDFCBANK:NSE)
  
  // Dynamic fields fetched from APIs or computed
  cmp?: number;           // Current Market Price
  peRatio?: number | string; // P/E Ratio
  eps?: number | string;  // Latest Earnings
  marketCap?: number | string; // Market Capitalization
  lastUpdated?: string;   // ISO timestamp
  isStale?: boolean;      // Indicates if fallback price was used
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  portfolioWeight: number; // percentage of total portfolio investment
  holdingsCount: number;
}

export interface PortfolioTotals {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  topGainer: Holding | null;
  worstPerformer: Holding | null;
}

export interface LiveStockData {
  symbol: string;
  cmp: number;
  peRatio: number | string;
  eps: number | string;
  marketCap?: number | string;
  source: 'yahoo-google' | 'fallback' | 'simulated';
  updatedAt: string;
}
