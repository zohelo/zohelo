// Illustrative quote snapshot shown by the Pulse section (static sample values).
export interface QuoteSnapshot {
  c: number;  // Current price
  d: number | null;  // Change
  dp: number | null; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t?: number; // Timestamp
}

export interface StockAssetInfo {
  symbol: string;
  name: string;
  company: string;
  exchange: string;
  currency: string;
  category: string;
  fallbackQuote: QuoteSnapshot;
}

export interface MarketIndicator {
  id: string;
  symbol: string;
  name: string;
  value: string;
  numericValue: number;
  change: string;
  isPositive: boolean;
  source: string;
  lastUpdated: string;
  sparkline: number[];
  category: 'index' | 'fx' | 'macro' | 'rates';
}

export interface MetricCardData {
  id: string;
  metricKey: string;
  title: string;
  currentValue: string;
  numericValue: number;
  badgeValue: string;
  isPositiveDelta: boolean;
  trendDirection: 'up' | 'down' | 'neutral';
  benchmark: string;
  description: string;
  sparklinePoints: { date: string; value: number }[];
  yamlDefinition: string;
  sqlQuery: string;
  dbtModel: string;
}

export interface FinanceTrendItem {
  year: string;
  dataValue: number; // Primary Data value (GUS public revenue/expenditure index)
  azureValue: number; // Comparative Azure benchmark / forecast index
  label: string;
  growthYoY: string;
}

export type ProductStatus = 'concept' | 'building' | 'live';

export interface ProductItem {
  id: string;
  name: string;
  oneLine: string;
  status: ProductStatus;
  href?: string;
}

export interface ConsultantProfile {
  name: string;
  title: string;
  headline: string;
  bio: string;
  experienceYears: number;
  email: string;
  timeline: {
    year: string;
    role: string;
    description: string;
    milestone: string;
  }[];
  consultingSpecialties: string[];
}
