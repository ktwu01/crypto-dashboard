import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Icon from '../ui/Icon';
import SectionSeparator from '../ui/SectionSeparator';
import TrendingCoins from './TrendingCoins';
import GainersLosers from './GainersLosers';

interface MarketOverviewProps {
  data?: {
    totalMarketCap: number;
    marketCapChange24h: number;
    totalVolume: number;
    bitcoinDominance: number;
  };
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ data }) => {
  const stats = [
    {
      title: 'Total Market Cap',
      value: data?.totalMarketCap ? `$${(data.totalMarketCap / 1e12).toFixed(2)}T` : '$2.45T',
      change: data?.marketCapChange24h ?? 2.34,
      icon: DollarSign,
      color: 'primary'
    },
    {
      title: '24h Volume',
      value: data?.totalVolume ? `$${(data.totalVolume / 1e9).toFixed(0)}B` : '$89.2B',
      change: 1.23, // Default value, as this is not in the global endpoint response
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Bitcoin Dominance',
      value: data?.bitcoinDominance ? `${data.bitcoinDominance.toFixed(1)}%` : '54.2%',
      change: -0.45, // Default value, as this is not in the global endpoint response
      icon: TrendingUp,
      color: 'bitcoin'
    },
    {
      title: 'Active Cryptos',
      value: '13,247', // This is a static value in the original code
      change: 0.89, // Default value
      icon: Activity,
      color: 'ethereum'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'text-primary-400',
      green: 'text-crypto-green',
      bitcoin: 'text-crypto-bitcoin',
      ethereum: 'text-crypto-ethereum'
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">Market Overview</h2>
          <p className="text-text-tertiary">Real-time global cryptocurrency market statistics</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse" />
          <span className="text-text-tertiary text-sm">Live Data</span>
        </div>
      </div>
      
      <SectionSeparator variant="gradient" spacing="sm" />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const isPositive = stat.change >= 0;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <GlassCard 
                className="p-6 hover:shadow-lg group" 
                glow={index === 0}
                elevated
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-text-tertiary text-sm font-medium">{stat.title}</p>
                    </div>
                    <p className="text-2xl font-bold text-text-primary mb-3 group-hover:text-white transition-colors">
                      {stat.value}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Icon
                        icon={isPositive ? TrendingUp : TrendingDown}
                        size="sm"
                        variant={isPositive ? 'success' : 'danger'}
                      />
                      <span className={`text-sm font-semibold ${
                        isPositive ? 'text-crypto-green' : 'text-crypto-red'
                      }`}>
                        {isPositive ? '+' : ''}{(stat.change ?? 0).toFixed(2)}%
                      </span>
                      <span className="text-text-muted text-xs">24h</span>
                    </div>
                  </div>
                  
                  {/* Icon with improved visual hierarchy */}
                  <div className={`
                    p-3 rounded-xl bg-glass-white/50 border border-glass-border/50
                    backdrop-blur-sm group-hover:bg-white/10 transition-all duration-200
                    ${getColorClasses(stat.color)}
                  `}>
                    <IconComponent className="w-6 h-6" strokeWidth={2} />
                  </div>
                </div>
                
                {/* Subtle bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-glass-border to-transparent opacity-30" />
              </GlassCard>
            </motion.div>
          );
        })}
        <TrendingCoins />
        <GainersLosers />
      </div>
    </div>
  );
};

export default MarketOverview;