import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Icon from '../ui/Icon';
import cryptoApi, { CryptoCurrency } from '../../services/cryptoApi';

const GainersLosers: React.FC = () => {
  const [data, setData] = useState<{ gainers: CryptoCurrency[]; losers: CryptoCurrency[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await cryptoApi.getGainersAndLosers();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch gainers and losers', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderCoinList = (coins: CryptoCurrency[], type: 'gainers' | 'losers') => (
    <div className="flex-1">
      <div className="flex items-center space-x-2 mb-3">
        <Icon icon={type === 'gainers' ? TrendingUp : TrendingDown} size="sm" variant={type === 'gainers' ? 'success' : 'danger'} />
        <h3 className="text-lg font-bold text-text-primary">{type === 'gainers' ? 'Top Gainers' : 'Top Losers'}</h3>
      </div>
      <div className="space-y-3">
        {coins.map(coin => (
          <div key={coin.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
              <span className="font-medium text-text-secondary">{coin.name}</span>
            </div>
            <span className={coin.price_change_percentage_24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}>
              {coin.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeleton = () => (
    <div className="flex-1 space-y-3 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/3"></div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-700"></div>
            <div className="h-4 bg-gray-700 rounded w-24"></div>
          </div>
          <div className="h-4 bg-gray-700 rounded w-12"></div>
        </div>
      ))}
    </div>
  );

  return (
    <GlassCard className="p-6 col-span-1 md:col-span-2 lg:col-span-4" elevated>
      <div className="flex flex-col md:flex-row md:space-x-6">
        {loading ? (
          <>
            {renderSkeleton()}
            <div className="border-r border-glass-border/50 mx-4 hidden md:block"></div>
            {renderSkeleton()}
          </>
        ) : data ? (
          <>
            {renderCoinList(data.gainers, 'gainers')}
            <div className="border-r border-glass-border/50 mx-4 hidden md:block"></div>
            {renderCoinList(data.losers, 'losers')}
          </>
        ) : (
          <div className="flex justify-center items-center h-48 w-full">
            <p className="text-text-tertiary">Could not load data.</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default GainersLosers;
