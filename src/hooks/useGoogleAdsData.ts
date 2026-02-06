import { useState, useEffect, useMemo } from 'react';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import {
  parseGoogleAdsCSV,
  GoogleAdsData,
  filterByDateRange,
  aggregateGoogleAdsMetrics,
  getTopKeywords,
  getGoogleAdsCampaignTrends,
  KeywordPerformance,
  GoogleAdsCampaignTrend
} from '@/lib/googleAdsParser';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0_xNSuB0SknTQqon9YlTPuP7zglj1OU77KGJbpWYE_aoU1vuJWwxnc7fT2XAxOzmDxnikRKjfeHz1/pub?gid=711754605&single=true&output=csv';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface GoogleAdsDashboardMetrics {
  totalSpend: number;
  totalConversions: number;
  totalImpressions: number;
  totalClicks: number;
  avgCPA: number;
  ctr: number;
  cpc: number;
}

// Função para garantir que "2026-02-04" vire 04/02 no horário LOCAL, ignorando o UTC
const toLocalDate = (dateInput: string | Date) => {
  if (dateInput instanceof Date) return dateInput;
  const [year, month, day] = dateInput.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export function useGoogleAdsData() {
  const [rawData, setRawData] = useState<GoogleAdsData[]>([]);
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
        const parsed = parseGoogleAdsCSV(text);

        // Tratamento de data na entrada para evitar inconsistências de fuso
        const normalizedData = parsed.map(item => ({
          ...item,
          date: toLocalDate(item.date)
        }));

        setRawData(normalizedData);
        
        if (normalizedData.length > 0) {
          // Padrão D-1: Ontem
          const to = endOfDay(subDays(new Date(), 1));
          
          // Padrão de 7 dias terminando ontem (Ex: 29/01 a 04/02)
          // Usamos 7 dias aqui para garantir que o 'from' seja D-7 (29/01 se hoje é 05/02)
          const from = startOfDay(subDays(to, 7));
          
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

  const metrics: GoogleAdsDashboardMetrics = useMemo(() => {
    return aggregateGoogleAdsMetrics(filteredData);
  }, [filteredData]);

  const topKeywords: KeywordPerformance[] = useMemo(() => {
    return getTopKeywords(filteredData, 10);
  }, [filteredData]);

  const campaignTrends: GoogleAdsCampaignTrend[] = useMemo(() => {
    if (!dateRange) return [];
    return getGoogleAdsCampaignTrends(filteredData, dateRange.to);
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
    topKeywords,
    campaignTrends,
    loading,
    error,
    dateRange,
    setDateRange,
    availableDateRange,
  };
}
