import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Star, Plus, ChevronRight, Info, Eye, EyeOff } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import CollapsibleSection from '../ui/CollapsibleSection';
import Icon from '../ui/Icon';
import SectionSeparator from '../ui/SectionSeparator';
import cryptoApiService, { CryptoCurrency, CryptoApiService } from '@/services/cryptoApi';

interface CryptoTableProps {
  cryptocurrencies: CryptoCurrency[];
  onAddToPortfolio?: (crypto: CryptoCurrency) => void;
}

const CryptoTable: React.FC<CryptoTableProps> = ({ cryptocurrencies, onAddToPortfolio }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const visibleCryptos = showAdvanced ? cryptocurrencies : cryptocurrencies.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">Top Cryptocurrencies</h2>
          <p className="text-text-tertiary">Live market data with real-time price updates</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse" />
            <span className="text-text-tertiary text-sm">Real-time data</span>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="
              flex items-center space-x-2 px-3 py-1.5 rounded-lg 
              bg-glass-white hover:bg-white/10 border border-glass-border
              text-text-secondary hover:text-text-primary transition-all duration-200
              backdrop-blur-sm
            "
          >
            <Icon icon={showAdvanced ? EyeOff : Eye} size="sm" />
            <span className="text-sm font-medium">
              {showAdvanced ? 'Show Less' : `Show All ${cryptocurrencies.length}`}
            </span>
          </button>
        </div>
      </div>
      
      <SectionSeparator variant="gradient" spacing="sm" />
      
      <GlassCard className="overflow-hidden" elevated>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-glass-border bg-glass-white/20">
                <th className="text-left text-text-tertiary text-sm font-semibold py-4 px-4">#</th>
                <th className="text-left text-text-tertiary text-sm font-semibold py-4 px-4">Name</th>
                <th className="text-left text-text-tertiary text-sm font-semibold py-4 px-4">Price</th>
                <th className="text-left text-text-tertiary text-sm font-semibold py-4 px-4">24h %</th>
                <th className="text-left text-text-tertiary text-sm font-semibold py-4 px-4">Market Cap</th>
                <th className="text-left text-text-tertiary text-sm font-semibold py-4 px-4">Volume (24h)</th>
                <th className="text-left text-text-tertiary text-sm font-semibold py-4 px-4">Chart</th>
                <th className="text-left text-text-tertiary text-sm font-semibold py-4 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCryptos.map((crypto, index) => {
                const isPositiveChange = crypto.price_change_percentage_24h >= 0;
                const isExpanded = expandedRows.has(crypto.id);
                
                return (
                  <React.Fragment key={crypto.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.4 }}
                      className="
                        border-b border-glass-border/30 
                        hover:bg-glass-white/30 transition-all duration-200
                        group cursor-pointer
                      "
                      onClick={() => toggleRowExpansion(crypto.id)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-text-muted text-sm font-medium">
                            {crypto.market_cap_rank}
                          </span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-text-muted group-hover:text-text-tertiary"
                          >
                            <ChevronRight className="w-3 h-3" strokeWidth={2} />
                          </motion.div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img 
                              src={crypto.image} 
                              alt={crypto.name}
                              className="w-10 h-10 rounded-full ring-2 ring-glass-border/50"
                            />
                            {crypto.market_cap_rank <= 3 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-crypto-bitcoin rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{crypto.market_cap_rank}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-text-primary font-semibold group-hover:text-white transition-colors">
                              {crypto.name}
                            </p>
                            <p className="text-text-muted text-sm uppercase font-medium">
                              {crypto.symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className="text-text-primary font-bold group-hover:text-white transition-colors">
                          {CryptoApiService.formatCurrency(crypto.current_price)}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Icon
                            icon={isPositiveChange ? TrendingUp : TrendingDown}
                            size="sm"
                            variant={isPositiveChange ? 'success' : 'danger'}
                          />
                          <span className={`text-sm font-bold ${
                            isPositiveChange ? 'text-crypto-green' : 'text-crypto-red'
                          }`}>
                            {CryptoApiService.formatPercentage(crypto.price_change_percentage_24h)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className="text-text-secondary font-medium">
                          {CryptoApiService.formatCurrency(crypto.market_cap)}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <span className="text-text-secondary font-medium">
                          {CryptoApiService.formatCurrency(crypto.total_volume)}
                        </span>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="w-24 h-10 rounded-lg overflow-hidden bg-glass-white/20 p-1">
                          <MiniSparkline 
                            data={crypto.sparkline_in_7d?.price || []} 
                            isPositive={isPositiveChange} 
                          />
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-2 rounded-lg text-text-muted hover:text-crypto-bitcoin hover:bg-crypto-bitcoin/10 transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add to favorites logic
                            }}
                          >
                            <Star className="w-4 h-4" strokeWidth={2} />
                          </button>
                          {onAddToPortfolio && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToPortfolio(crypto);
                              }}
                              className="p-2 rounded-lg text-text-muted hover:text-primary-400 hover:bg-primary-500/10 transition-all duration-200"
                            >
                              <Plus className="w-4 h-4" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                    
                    {/* Expanded Row Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <td colSpan={8} className="p-0 border-b border-glass-border/30">
                            <div className="bg-glass-white/10 p-6 space-y-4">
                              <h4 className="text-text-primary font-semibold mb-3 flex items-center space-x-2">
                                <Info className="w-4 h-4 text-primary-400" />
                                <span>Detailed Information</span>
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                  <p className="text-text-muted text-sm">All-Time High</p>
                                  <p className="text-text-secondary font-semibold">
                                    {CryptoApiService.formatCurrency(crypto.ath)}
                                  </p>
                                  <p className={`text-xs ${
                                    crypto.ath_change_percentage >= 0 ? 'text-crypto-green' : 'text-crypto-red'
                                  }`}>
                                    {CryptoApiService.formatPercentage(crypto.ath_change_percentage)} from ATH
                                  </p>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-text-muted text-sm">Circulating Supply</p>
                                  <p className="text-text-secondary font-semibold">
                                    {crypto.circulating_supply?.toLocaleString() || 'N/A'}
                                  </p>
                                  <p className="text-text-muted text-xs uppercase">
                                    {crypto.symbol}
                                  </p>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-text-muted text-sm">Total Supply</p>
                                  <p className="text-text-secondary font-semibold">
                                    {crypto.total_supply?.toLocaleString() || 'N/A'}
                                  </p>
                                </div>
                                
                                <div className="space-y-1">
                                  <p className="text-text-muted text-sm">Max Supply</p>
                                  <p className="text-text-secondary font-semibold">
                                    {crypto.max_supply?.toLocaleString() || '∞'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {!showAdvanced && cryptocurrencies.length > 10 && (
          <div className="p-6 border-t border-glass-border bg-glass-white/10">
            <button
              onClick={() => setShowAdvanced(true)}
              className="
                w-full flex items-center justify-center space-x-2 py-3 rounded-lg
                bg-glass-white hover:bg-white/10 border border-glass-border
                text-text-secondary hover:text-text-primary transition-all duration-200
                backdrop-blur-sm group
              "
            >
              <span className="font-medium">Show {cryptocurrencies.length - 10} More Cryptocurrencies</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

// Enhanced Mini sparkline component
const MiniSparkline: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  if (!data.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-text-muted text-xs">No data</span>
      </div>
    );
  }
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((price, index) => {
    const x = (index / (data.length - 1)) * 88;
    const y = 32 - ((price - min) / range) * 24;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width="88" height="32" className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${isPositive ? 'green' : 'red'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isPositive ? '#00d4aa' : '#ff6b6b'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isPositive ? '#00d4aa' : '#ff6b6b'} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      
      {/* Fill area */}
      <path
        d={`M ${points} L 88,32 L 0,32 Z`}
        fill={`url(#gradient-${isPositive ? 'green' : 'red'})`}
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#00d4aa' : '#ff6b6b'}
        strokeWidth="2"
        className="drop-shadow-sm"
      />
    </svg>
  );
};

export default CryptoTable;