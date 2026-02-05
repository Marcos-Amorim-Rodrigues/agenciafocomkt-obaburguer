import { KeywordPerformance } from '@/lib/googleAdsParser';
import { formatCurrency, formatNumber } from '@/lib/csvParser';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, TrendingUp } from 'lucide-react';

interface TopKeywordsProps {
  keywords: KeywordPerformance[];
}

export function TopKeywords({ keywords }: TopKeywordsProps) {
  if (keywords.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhuma palavra-chave encontrada no período</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Principais Palavras-chave</h2>
          <p className="text-sm text-muted-foreground">Ranqueadas por volume de conversões</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Ranking</TableHead>
              <TableHead className="text-muted-foreground font-medium">Palavra-chave</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Conversões</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Custo</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">CPA</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">CTR</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">CPC</TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Impressões</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((keyword, index) => (
              <TableRow key={keyword.keyword} className="border-border/20 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                        index === 1 ? 'bg-gray-400/20 text-gray-300' : 
                        index === 2 ? 'bg-amber-700/20 text-amber-600' : 
                        'bg-muted/30 text-muted-foreground'}
                    `}>
                      {index + 1}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate max-w-[200px]" title={keyword.keyword}>
                      {keyword.keyword}
                    </span>
                    {index < 3 && (
                      <TrendingUp className="h-3 w-3 text-dashboard-success flex-shrink-0" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-dashboard-success">
                    {formatNumber(keyword.conversions)}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(keyword.spend)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={keyword.costPerConversion <= 50 ? 'text-dashboard-success' : 'text-dashboard-warning'}>
                    {formatCurrency(keyword.costPerConversion)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={keyword.ctr >= 2 ? 'text-dashboard-success' : 'text-muted-foreground'}>
                    {keyword.ctr.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(keyword.cpc)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatNumber(keyword.impressions)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
