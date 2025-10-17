import { useState, useEffect } from 'react';

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  purchasePrice: number;
  currentPrice: number;
  image?: string;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercentage: number;
}

const PORTFOLIO_STORAGE_KEY = 'crypto-portfolio';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load portfolio from localStorage on mount
  useEffect(() => {
    const loadPortfolio = () => {
      try {
        const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        if (saved) {
          setPortfolio(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  // Save portfolio to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio));
      } catch (error) {
        console.error('Error saving portfolio:', error);
      }
    }
  }, [portfolio, isLoading]);

  const addAsset = (asset: Omit<PortfolioAsset, 'currentPrice'>) => {
    const newAsset: PortfolioAsset = {
      ...asset,
      currentPrice: asset.purchasePrice, // Will be updated by market data
    };

    setPortfolio(prev => {
      const existingIndex = prev.findIndex(item => item.id === asset.id);
      if (existingIndex >= 0) {
        // Update existing asset
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          amount: updated[existingIndex].amount + asset.amount,
          // Update average purchase price
          purchasePrice: 
            (updated[existingIndex].purchasePrice * updated[existingIndex].amount + 
             asset.purchasePrice * asset.amount) / 
            (updated[existingIndex].amount + asset.amount)
        };
        return updated;
      } else {
        // Add new asset
        return [...prev, newAsset];
      }
    });
  };

  const removeAsset = (id: string) => {
    setPortfolio(prev => prev.filter(asset => asset.id !== id));
  };

  const updateAssetPrice = (id: string, currentPrice: number) => {
    setPortfolio(prev => 
      prev.map(asset => 
        asset.id === id 
          ? { ...asset, currentPrice }
          : asset
      )
    );
  };

  const updateMultiplePrices = (priceUpdates: Record<string, number>) => {
    setPortfolio(prev => 
      prev.map(asset => ({
        ...asset,
        currentPrice: priceUpdates[asset.id] || asset.currentPrice
      }))
    );
  };

  const clearPortfolio = () => {
    setPortfolio([]);
  };

  // Calculate portfolio statistics
  const getPortfolioStats = (): PortfolioStats => {
    const stats = portfolio.reduce(
      (acc, asset) => {
        const cost = asset.amount * asset.purchasePrice;
        const value = asset.amount * asset.currentPrice;
        const profit = value - cost;

        return {
          totalValue: acc.totalValue + value,
          totalCost: acc.totalCost + cost,
          totalProfit: acc.totalProfit + profit,
        };
      },
      { totalValue: 0, totalCost: 0, totalProfit: 0 }
    );

    const totalProfitPercentage = stats.totalCost > 0 
      ? ((stats.totalProfit / stats.totalCost) * 100) 
      : 0;

    return {
      ...stats,
      totalProfitPercentage,
    };
  };

  return {
    portfolio,
    isLoading,
    addAsset,
    removeAsset,
    updateAssetPrice,
    updateMultiplePrices,
    clearPortfolio,
    getPortfolioStats,
  };
};