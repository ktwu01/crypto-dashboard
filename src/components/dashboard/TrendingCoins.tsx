import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Icon from '../ui/Icon';
import SectionSeparator from '../ui/SectionSeparator';
import cryptoApi, { CryptoApiService } from '../../services/cryptoApi';

interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    small: string;
    market_cap_rank: number;
    price_btc: number;
  };
}

const TrendingCoins: React.FC = () => {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        setLoading(true);
        const coins = await cryptoApi.getTrendingCoins();
        setTrendingCoins(coins);
      } catch (error) {
        console.error('Failed to fetch trending coins', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCoins();
  }, []);

  return (
    <GlassCard className="p-6 col-span-1 md:col-span-2 lg:col-span-4" elevated>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon icon={Flame} size="md" variant="danger" />
          <h2 className="text-xl font-bold text-text-primary">Trending Coins</h2>
        </div>
        <p className="text-text-tertiary text-sm">Top-3 on CoinGecko</p>
      </div>
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-700"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {trendingCoins.map((coin) => (
            <motion.div
              key={coin.item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-white/5"
            >
              <img src={coin.item.small} alt={coin.item.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <p className="font-bold text-text-primary">{coin.item.name}</p>
                <p className="text-sm text-text-tertiary">{coin.item.symbol.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-muted">Rank</p>
                <p className="font-bold text-text-primary">#{coin.item.market_cap_rank}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default TrendingCoins;
