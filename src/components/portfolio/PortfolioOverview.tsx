import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { PortfolioAsset, PortfolioStats } from '@/hooks/usePortfolio';
import { CryptoApiService } from '@/services/cryptoApi';

interface PortfolioOverviewProps {
  portfolio: PortfolioAsset[];
  stats: PortfolioStats;
  onRemoveAsset: (id: string) => void;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ 
  portfolio, 
  stats, 
  onRemoveAsset 
}) => {
  return (
    <div className="space-y-6">
      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6" glow>
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-primary-500/20">
              <TrendingUp className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">
                {CryptoApiService.formatCurrency(stats.totalValue)}
              </p>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6" glow>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              stats.totalProfit >= 0 ? 'bg-crypto-green/20' : 'bg-crypto-red/20'
            }`}>
              {stats.totalProfit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-crypto-green" />
              ) : (
                <TrendingDown className="w-6 h-6 text-crypto-red" />
              )}
            </div>
            <div>
              <p className="text-white/60 text-sm">Total P&L</p>
              <p className={`text-2xl font-bold ${
                stats.totalProfit >= 0 ? 'text-crypto-green' : 'text-crypto-red'
              }`}>
                {CryptoApiService.formatCurrency(stats.totalProfit)}
              </p>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6" glow>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              stats.totalProfitPercentage >= 0 ? 'bg-crypto-green/20' : 'bg-crypto-red/20'
            }`}>
              {stats.totalProfitPercentage >= 0 ? (
                <TrendingUp className="w-6 h-6 text-crypto-green" />
              ) : (
                <TrendingDown className="w-6 h-6 text-crypto-red" />
              )}
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Return</p>
              <p className={`text-2xl font-bold ${
                stats.totalProfitPercentage >= 0 ? 'text-crypto-green' : 'text-crypto-red'
              }`}>
                {CryptoApiService.formatPercentage(stats.totalProfitPercentage)}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
      
      {/* Portfolio Holdings */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Holdings</h2>
          <span className="text-white/60 text-sm">{portfolio.length} Assets</span>
        </div>
        
        {portfolio.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/60 text-lg mb-2">No assets in your portfolio</p>
            <p className="text-white/40 text-sm">Add some cryptocurrencies to start tracking your portfolio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/60 text-sm font-medium py-3 px-2">Asset</th>
                  <th className="text-left text-white/60 text-sm font-medium py-3 px-2">Amount</th>
                  <th className="text-left text-white/60 text-sm font-medium py-3 px-2">Avg. Cost</th>
                  <th className="text-left text-white/60 text-sm font-medium py-3 px-2">Current Price</th>
                  <th className="text-left text-white/60 text-sm font-medium py-3 px-2">Value</th>
                  <th className="text-left text-white/60 text-sm font-medium py-3 px-2">P&L</th>
                  <th className="text-left text-white/60 text-sm font-medium py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((asset, index) => {
                  const currentValue = asset.amount * asset.currentPrice;
                  const cost = asset.amount * asset.purchasePrice;
                  const profit = currentValue - cost;
                  const profitPercentage = cost > 0 ? (profit / cost) * 100 : 0;
                  
                  return (
                    <motion.tr
                      key={asset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          {asset.image && (
                            <img 
                              src={asset.image} 
                              alt={asset.name}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <p className="text-white font-medium text-sm">{asset.name}</p>
                            <p className="text-white/50 text-xs uppercase">{asset.symbol}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-2">
                        <span className="text-white">{asset.amount.toFixed(6)}</span>
                      </td>
                      
                      <td className="py-4 px-2">
                        <span className="text-white/80">
                          {CryptoApiService.formatCurrency(asset.purchasePrice)}
                        </span>
                      </td>
                      
                      <td className="py-4 px-2">
                        <span className="text-white">
                          {CryptoApiService.formatCurrency(asset.currentPrice)}
                        </span>
                      </td>
                      
                      <td className="py-4 px-2">
                        <span className="text-white font-medium">
                          {CryptoApiService.formatCurrency(currentValue)}
                        </span>
                      </td>
                      
                      <td className="py-4 px-2">
                        <div>
                          <div className={`text-sm font-medium ${
                            profit >= 0 ? 'text-crypto-green' : 'text-crypto-red'
                          }`}>
                            {CryptoApiService.formatCurrency(profit)}
                          </div>
                          <div className={`text-xs ${
                            profitPercentage >= 0 ? 'text-crypto-green' : 'text-crypto-red'
                          }`}>
                            {CryptoApiService.formatPercentage(profitPercentage)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-2">
                        <button 
                          onClick={() => onRemoveAsset(asset.id)}
                          className="p-1 rounded text-white/60 hover:text-crypto-red hover:bg-crypto-red/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default PortfolioOverview;