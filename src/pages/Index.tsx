import { useState } from 'react';
import { DollarSign, MessageCircle, Eye, Users, Target, TrendingUp, MousePointer, BarChart3 } from 'lucide-react';
import { useCampaignData } from '@/hooks/useCampaignData';
import { useGoogleAdsData } from '@/hooks/useGoogleAdsData';
import { formatCurrency, formatNumber } from '@/lib/csvParser';
import { Header } from '@/components/dashboard/Header';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { BigNumberCard } from '@/components/dashboard/BigNumberCard';
import { TrendsTable } from '@/components/dashboard/TrendsTable';
import { TopCreatives } from '@/components/dashboard/TopCreatives';
import { TopKeywords } from '@/components/dashboard/TopKeywords';
import { LoadingState, ErrorState } from '@/components/dashboard/LoadingState';
import { AdPlatform } from '@/components/dashboard/PlatformToggle';

const Index = () => {
  const [platform, setPlatform] = useState<AdPlatform>('meta');
  
  const metaData = useCampaignData();
  const googleData = useGoogleAdsData();

  const currentData = platform === 'meta' ? metaData : googleData;

  if (currentData.loading) return <LoadingState />;
  if (currentData.error) return <ErrorState message={currentData.error} />;

  return (
    <div className="min-h-screen animated-bg relative">
      <div className="relative z-10 max-w-7xl mx-auto">
        <Header platform={platform} onPlatformChange={setPlatform} />

        <main className="p-6 space-y-8">
          {/* Date Filter */}
          <DateFilter
            dateRange={currentData.dateRange}
            onDateRangeChange={currentData.setDateRange}
            availableDateRange={currentData.availableDateRange}
          />

          {/* Big Numbers Grid - Meta Ads */}
          {platform === 'meta' && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <BigNumberCard
                title="Investimento Total"
                value={formatCurrency(metaData.metrics.totalSpend)}
                icon={DollarSign}
                variant="primary"
                delay={0}
              />
              <BigNumberCard
                title="Conversões"
                value={formatNumber(metaData.metrics.totalConversions)}
                subtitle="Mensagens iniciadas"
                icon={MessageCircle}
                variant="success"
                delay={50}
              />
              <BigNumberCard
                title="CPA Médio"
                value={formatCurrency(metaData.metrics.avgCPA)}
                subtitle="Custo por conversão"
                icon={Target}
                variant="warning"
                delay={100}
              />
              <BigNumberCard
                title="Alcance"
                value={formatNumber(metaData.metrics.totalReach)}
                subtitle="Pessoas alcançadas"
                icon={Users}
                delay={150}
              />
              <BigNumberCard
                title="Impressões"
                value={formatNumber(metaData.metrics.totalImpressions)}
                icon={Eye}
                delay={200}
              />
              <BigNumberCard
                title="Engajamento"
                value={formatNumber(metaData.metrics.totalEngagement)}
                icon={TrendingUp}
                delay={250}
              />
            </section>
          )}

          {/* Big Numbers Grid - Google Ads */}
          {platform === 'google' && (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <BigNumberCard
                title="Investimento Total"
                value={formatCurrency(googleData.metrics.totalSpend)}
                icon={DollarSign}
                variant="primary"
                delay={0}
              />
              <BigNumberCard
                title="Conversões"
                value={formatNumber(googleData.metrics.totalConversions)}
                icon={MessageCircle}
                variant="success"
                delay={50}
              />
              <BigNumberCard
                title="CPA Médio"
                value={formatCurrency(googleData.metrics.avgCPA)}
                subtitle="Custo por conversão"
                icon={Target}
                variant="warning"
                delay={100}
              />
              <BigNumberCard
                title="CTR"
                value={`${googleData.metrics.ctr.toFixed(2)}%`}
                subtitle="Taxa de cliques"
                icon={MousePointer}
                delay={150}
              />
              <BigNumberCard
                title="Impressões"
                value={formatNumber(googleData.metrics.totalImpressions)}
                icon={Eye}
                delay={200}
              />
              <BigNumberCard
                title="CPC"
                value={formatCurrency(googleData.metrics.cpc)}
                subtitle="Custo por clique"
                icon={BarChart3}
                delay={250}
              />
            </section>
          )}

          {/* Trends Table */}
          <section>
            <TrendsTable trends={currentData.campaignTrends} />
          </section>

          {/* Top Creatives (Meta) / Top Keywords (Google) */}
          <section>
            {platform === 'meta' ? (
              <TopCreatives creatives={metaData.topCreatives} />
            ) : (
              <TopKeywords keywords={googleData.topKeywords} />
            )}
          </section>

          {/* Footer */}
          <footer className="text-center py-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              Dashboard desenvolvido por{' '}
              <span className="text-primary font-semibold">Foco Marketing</span>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
