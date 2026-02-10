import { useState, useEffect, useMemo } from 'react';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import {
  parseCSV,
  CampaignData,
  filterByDateRange,
  aggregateMetrics,
  getTopCreatives,
  getCampaignTrends,
  AdPerformance,
  CampaignTrend
} from '@/lib/csvParser';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQd8NHg8n3eEhS3MTU22XZKK_0600UPqsLGPeY-d44AsivNYYk2T37SiFUr9DhPTEQ448wjiokQDTKs/pub?gid=0&single=true&output=csv';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardMetrics {
  totalSpend: number;
  totalConversions: number;
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  avgCPA: number;
  ctr: number;
}

// Função para garantir leitura local da data (evita bug de -1 dia)
const toLocalDate = (dateInput: string | Date) => {
  if (dateInput instanceof Date) return dateInput;
  const [year, month, day] = dateInput.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function useCampaignData() {
  const [rawData, setRawData] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const text = await response.text();
        const parsed = parseCSV(text);

        // Normalização imediata das datas
        const normalizedData = parsed.map(item => ({
          ...item,
          date: toLocalDate(item.date)
        }));

        setRawData(normalizedData);
        
        if (normalizedData.length > 0) {
          // Fixa o período inicial em 7 dias (D-7 até Ontem)
          const to = endOfDay(subDays(new Date(), 1));
          const from = startOfDay(subDays(to, 7)); // 7 dias para pegar a janela correta
          
          setDateRange({ from, to });
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!dateRange) return [];
    return filterByDateRange(rawData, dateRange.from, dateRange.to);
  }, [rawData, dateRange]);

  const metrics: DashboardMetrics = useMemo(() => {
    const agg = aggregateMetrics(filteredData);
    const avgCPA = agg.totalConversions > 0 ? agg.totalSpend / agg.totalConversions : 0;
    const ctr = agg.totalImpressions > 0 ? (agg.totalEngagement / agg.totalImpressions) * 100 : 0;

    return {
      ...agg,
      avgCPA: Number(avgCPA.toFixed(2)),
      ctr: Number(ctr.toFixed(2)),
    };
  }, [filteredData]);

  const topCreatives: AdPerformance[] = useMemo(() => {
    return getTopCreatives(filteredData, 6);
  }, [filteredData]);

  const campaignTrends: CampaignTrend[] = useMemo(() => {
    if (!dateRange) return [];
    return getCampaignTrends(filteredData, dateRange.to);
  }, [filteredData, dateRange]);

  const availableDateRange = useMemo(() => {
    if (rawData.length === 0) return null;

    const dates = rawData
      .map(d => toLocalDate(d.date))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      min: dates[0],
      max: dates[dates.length - 1],
    };
  }, [rawData]);

  return {
    rawData,
    filteredData,
    metrics,
    topCreatives,
    campaignTrends,
    loading,
    error,
    dateRange,
    setDateRange,
    availableDateRange,
  };
}
