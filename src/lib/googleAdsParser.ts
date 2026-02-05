export interface GoogleAdsData {
  accountName: string;
  date: string;
  campaignName: string;
  keyword: string;
  spend: number;
  conversions: number;
  costPerConversion: number;
  impressions: number;
  clicks: number;
}

export function parseNumber(value: string): number {
  if (!value || value === '') return 0;
  // Handle comma as decimal separator
  const cleaned = value.replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

export function parseGoogleAdsCSV(csvText: string): GoogleAdsData[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const data: GoogleAdsData[] = [];

  // Header starts at line 13 (index 12), data starts at line 14 (index 13)
  // Skip first 13 lines (0-12), start processing from index 13
  for (let i = 13; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);

    if (fields.length >= 9) {
      const entry: GoogleAdsData = {
        accountName: fields[0] || '',
        date: fields[1] || '',
        campaignName: fields[2] || '',
        keyword: fields[3] || '',
        spend: parseNumber(fields[4]),
        conversions: parseNumber(fields[5]),
        costPerConversion: parseNumber(fields[6]),
        impressions: parseNumber(fields[7]),
        clicks: parseNumber(fields[8]),
      };

      // Only include rows with actual campaign data
      if (entry.campaignName || entry.spend > 0 || entry.impressions > 0) {
        data.push(entry);
      }
    }
  }

  return data;
}

export function filterByDateRange(data: GoogleAdsData[], startDate: Date, endDate: Date): GoogleAdsData[] {
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

export function aggregateGoogleAdsMetrics(data: GoogleAdsData[]) {
  const totals = data.reduce(
    (acc, item) => ({
      totalSpend: acc.totalSpend + item.spend,
      totalConversions: acc.totalConversions + item.conversions,
      totalImpressions: acc.totalImpressions + item.impressions,
      totalClicks: acc.totalClicks + item.clicks,
    }),
    { totalSpend: 0, totalConversions: 0, totalImpressions: 0, totalClicks: 0 }
  );

  const avgCPA = totals.totalConversions > 0 ? totals.totalSpend / totals.totalConversions : 0;
  const ctr = totals.totalImpressions > 0 ? (totals.totalClicks / totals.totalImpressions) * 100 : 0;
  const cpc = totals.totalClicks > 0 ? totals.totalSpend / totals.totalClicks : 0;

  return {
    ...totals,
    avgCPA,
    ctr,
    cpc,
  };
}

export interface KeywordPerformance {
  keyword: string;
  campaignName: string;
  spend: number;
  conversions: number;
  costPerConversion: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
}

export function getTopKeywords(data: GoogleAdsData[], limit: number = 10): KeywordPerformance[] {
  const keywordMap = new Map<string, KeywordPerformance>();

  data.forEach(item => {
    if (!item.keyword) return;

    const existing = keywordMap.get(item.keyword);
    if (existing) {
      existing.spend += item.spend;
      existing.conversions += item.conversions;
      existing.impressions += item.impressions;
      existing.clicks += item.clicks;
    } else {
      keywordMap.set(item.keyword, {
        keyword: item.keyword,
        campaignName: item.campaignName,
        spend: item.spend,
        conversions: item.conversions,
        costPerConversion: 0,
        impressions: item.impressions,
        clicks: item.clicks,
        ctr: 0,
        cpc: 0,
      });
    }
  });

  const keywords = Array.from(keywordMap.values());

  // Calculate derived metrics
  keywords.forEach(kw => {
    kw.costPerConversion = kw.conversions > 0 ? kw.spend / kw.conversions : 0;
    kw.ctr = kw.impressions > 0 ? (kw.clicks / kw.impressions) * 100 : 0;
    kw.cpc = kw.clicks > 0 ? kw.spend / kw.clicks : 0;
  });

  // Sort by conversions (best performers first)
  return keywords
    .filter(kw => kw.conversions > 0)
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, limit);
}

export interface GoogleAdsCampaignTrend {
  campaignName: string;
  cost7d: number;
  cost14d: number;
  cost30d: number;
  conversions7d: number;
  conversions14d: number;
  conversions30d: number;
  cpa7d: number;
  cpa14d: number;
  cpa30d: number;
}

export function getGoogleAdsCampaignTrends(data: GoogleAdsData[], referenceDate?: Date): GoogleAdsCampaignTrend[] {
  const endDate = referenceDate || new Date();

  const getDataForDays = (days: number) => {
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);
    return filterByDateRange(data, startDate, endDate);
  };

  const data7d = getDataForDays(7);
  const data14d = getDataForDays(14);
  const data30d = getDataForDays(30);

  const campaigns = new Set<string>();
  data.forEach(item => {
    if (item.campaignName) campaigns.add(item.campaignName);
  });

  const trends: GoogleAdsCampaignTrend[] = [];

  campaigns.forEach(campaignName => {
    const filter7d = data7d.filter(d => d.campaignName === campaignName);
    const filter14d = data14d.filter(d => d.campaignName === campaignName);
    const filter30d = data30d.filter(d => d.campaignName === campaignName);

    const agg7d = aggregateGoogleAdsMetrics(filter7d);
    const agg14d = aggregateGoogleAdsMetrics(filter14d);
    const agg30d = aggregateGoogleAdsMetrics(filter30d);

    if (agg30d.totalSpend > 0 || agg14d.totalSpend > 0 || agg7d.totalSpend > 0) {
      trends.push({
        campaignName,
        cost7d: agg7d.totalSpend,
        cost14d: agg14d.totalSpend,
        cost30d: agg30d.totalSpend,
        conversions7d: agg7d.totalConversions,
        conversions14d: agg14d.totalConversions,
        conversions30d: agg30d.totalConversions,
        cpa7d: agg7d.avgCPA,
        cpa14d: agg14d.avgCPA,
        cpa30d: agg30d.avgCPA,
      });
    }
  });

  return trends.sort((a, b) => b.cost30d - a.cost30d);
}
