import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CampaignTrend, formatCurrency, formatNumber } from '@/lib/csvParser';
import { GoogleAdsCampaignTrend } from '@/lib/googleAdsParser';
import { cn } from '@/lib/utils';

type TrendData = CampaignTrend | GoogleAdsCampaignTrend;

interface TrendsTableProps {
  trends: TrendData[];
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  if (current === 0 && previous === 0) {
    return <span className="text-muted-foreground text-xs">–</span>;
  }

  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  // For CPA, lower is better
  if (change < -10) {
    return (
      <span className="flex items-center gap-1 text-dashboard-success text-xs font-medium bg-dashboard-success/10 px-2 py-1 rounded-full">
        <TrendingDown className="h-3 w-3" />
        Melhorando
      </span>
    );
  } else if (change > 10) {
    return (
      <span className="flex items-center gap-1 text-dashboard-danger text-xs font-medium bg-dashboard-danger/10 px-2 py-1 rounded-full">
        <TrendingUp className="h-3 w-3" />
        Piorando
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-dashboard-warning text-xs font-medium bg-dashboard-warning/10 px-2 py-1 rounded-full">
      <Minus className="h-3 w-3" />
      Estável
    </span>
  );
}

export function TrendsTable({ trends }: TrendsTableProps) {
  const displayTrends = trends.slice(0, 8);

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
      <div className="p-6 border-b border-border/50">
        <h3 className="text-lg font-semibold">Tendências de Campanhas</h3>
        <p className="text-sm text-muted-foreground mt-1">Comparativo de Custo, Leads e CPA nos últimos 7, 14 e 30 dias (baseado no filtro selecionado)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/30 border-b border-border/30">
              <th rowSpan={2} className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider align-bottom border-r border-border/30">
                Campanha
              </th>
              <th colSpan={3} className="text-center p-2 text-xs font-bold text-primary uppercase tracking-wider border-b border-border/30">
                7 dias
              </th>
              <th colSpan={3} className="text-center p-2 text-xs font-bold text-primary uppercase tracking-wider border-b border-border/30">
                14 dias
              </th>
              <th colSpan={3} className="text-center p-2 text-xs font-bold text-primary uppercase tracking-wider border-b border-border/30">
                30 dias
              </th>
              <th rowSpan={2} className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider align-bottom border-l border-border/30">
                Status
              </th>
            </tr>
            <tr className="bg-secondary/20">
              <th className="text-center p-2 text-xs font-medium text-muted-foreground">Custo</th>
              <th className="text-center p-2 text-xs font-medium text-muted-foreground">Leads</th>
              <th className="text-center p-2 text-xs font-medium text-muted-foreground border-r border-border/20">CPA</th>
              <th className="text-center p-2 text-xs font-medium text-muted-foreground">Custo</th>
              <th className="text-center p-2 text-xs font-medium text-muted-foreground">Leads</th>
              <th className="text-center p-2 text-xs font-medium text-muted-foreground border-r border-border/20">CPA</th>
              <th className="text-center p-2 text-xs font-medium text-muted-foreground">Custo</th>
              <th className="text-center p-2 text-xs font-medium text-muted-foreground">Leads</th>
              <th className="text-center p-2 text-xs font-medium text-muted-foreground">CPA</th>
            </tr>
          </thead>
          <tbody>
            {displayTrends.map((trend, index) => (
              <tr
                key={trend.campaignName}
                className={cn(
                  "border-b border-border/30 hover:bg-secondary/20 transition-colors",
                  index % 2 === 0 ? 'bg-transparent' : 'bg-secondary/10'
                )}
              >
                <td className="p-4 border-r border-border/30">
                  <p className="font-medium text-sm line-clamp-2 max-w-[200px]" title={trend.campaignName}>
                    {trend.campaignName.replace(/\[/g, '').replace(/\]/g, ' ').trim()}
                  </p>
                </td>
                {/* 7 dias */}
                <td className="p-2 text-center">
                  <span className="text-xs text-foreground">
                    {trend.cost7d > 0 ? formatCurrency(trend.cost7d) : '–'}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <span className="text-xs text-foreground">
                    {trend.conversions7d > 0 ? formatNumber(trend.conversions7d) : '–'}
                  </span>
                </td>
                <td className="p-2 text-center border-r border-border/20">
                  <span className={cn("text-xs font-semibold", trend.cpa7d > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                    {trend.cpa7d > 0 ? formatCurrency(trend.cpa7d) : '–'}
                  </span>
                </td>
                {/* 14 dias */}
                <td className="p-2 text-center">
                  <span className="text-xs text-foreground">
                    {trend.cost14d > 0 ? formatCurrency(trend.cost14d) : '–'}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <span className="text-xs text-foreground">
                    {trend.conversions14d > 0 ? formatNumber(trend.conversions14d) : '–'}
                  </span>
                </td>
                <td className="p-2 text-center border-r border-border/20">
                  <span className={cn("text-xs font-semibold", trend.cpa14d > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                    {trend.cpa14d > 0 ? formatCurrency(trend.cpa14d) : '–'}
                  </span>
                </td>
                {/* 30 dias */}
                <td className="p-2 text-center">
                  <span className="text-xs text-foreground">
                    {trend.cost30d > 0 ? formatCurrency(trend.cost30d) : '–'}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <span className="text-xs text-foreground">
                    {trend.conversions30d > 0 ? formatNumber(trend.conversions30d) : '–'}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <span className={cn("text-xs font-semibold", trend.cpa30d > 0 ? 'text-primary' : 'text-muted-foreground')}>
                    {trend.cpa30d > 0 ? formatCurrency(trend.cpa30d) : '–'}
                  </span>
                </td>
                <td className="p-4 border-l border-border/30">
                  <div className="flex justify-center">
                    <TrendIndicator current={trend.cpa7d} previous={trend.cpa30d} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trends.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          Nenhum dado de tendência disponível
        </div>
      )}
    </div>
  );
}
