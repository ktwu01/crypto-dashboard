import React from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Icon from '@/components/ui/Icon';

interface DashboardMarketStatsProps {
  data?: {
    totalMarketCap: number;
    marketCapChange24h: number;
    totalVolume: number;
    bitcoinDominance: number;
  };
}

const DashboardMarketStats: React.FC<DashboardMarketStatsProps> = ({ data }) => {
  const stats = [
    {
      title: 'Total Market Cap',
      value: data?.totalMarketCap
        ? `$${(data.totalMarketCap / 1e12).toFixed(2)}T`
        : '$2.45T',
      change: data?.marketCapChange24h ?? 2.34,
      icon: DollarSign,
    },
    {
      title: '24h Volume',
      value: data?.totalVolume
        ? `$${(data.totalVolume / 1e9).toFixed(1)}B`
        : '$89.2B',
      change: 1.23,
      icon: Activity,
    },
    {
      title: 'Bitcoin Dominance',
      value: data?.bitcoinDominance
        ? `${data.bitcoinDominance.toFixed(1)}%`
        : '54.2%',
      change: -0.45,
      icon: TrendingUp,
    },
    {
      title: 'Active Cryptos',
      value: '13,247',
      change: 0.89,
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        const isPositive = stat.change >= 0;

        return (
          <GlassCard key={stat.title} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-tertiary">
                  {stat.title}
                </p>
                <p className="mt-2 text-2xl font-semibold text-text-primary">
                  {stat.value}
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Icon
                    icon={isPositive ? TrendingUp : TrendingDown}
                    size="sm"
                    variant={isPositive ? 'success' : 'danger'}
                  />
                  <span
                    className={`font-semibold ${
                      isPositive ? 'text-crypto-green' : 'text-crypto-red'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {Math.abs(stat.change).toFixed(2)}%
                  </span>
                  <span className="text-text-muted text-xs">24h</span>
                </div>
              </div>
              <div className="rounded-lg bg-white/10 p-3 text-white/70">
                <IconComponent className="h-5 w-5" strokeWidth={2} />
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

export default DashboardMarketStats;
