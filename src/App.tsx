import React, { useState, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BarChart3, 
  Activity,
  Plus
} from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import MarketOverview from './components/dashboard/MarketOverview';
import AiInsights from './components/dashboard/AiInsights';
import DashboardMarketStats from './components/dashboard/DashboardMarketStats';
import CryptoTable from './components/markets/CryptoTable';
import CryptoChart from './components/charts/CryptoChart';
import PortfolioOverview from './components/portfolio/PortfolioOverview';
import AddAssetModal from './components/portfolio/AddAssetModal';
import Loading from './components/ui/Loading';
import GlassCard from './components/ui/GlassCard';
import CollapsibleSection from './components/ui/CollapsibleSection';
import SectionSeparator from './components/ui/SectionSeparator';
import Icon from './components/ui/Icon';
import { usePortfolio } from './hooks/usePortfolio';
import cryptoApiService, { CryptoCurrency, MarketChartData } from './services/cryptoApi';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency | undefined>();
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState('7');
  const [chartCoin, setChartCoin] = useState<CryptoCurrency | undefined>();
  const dashboardBackground = useMemo(
    () => ({
      backgroundImage:
        'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08), transparent 55%), radial-gradient(circle at 80% 0%, rgba(248,113,113,0.08), transparent 50%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }),
    []
  );
  
  const {
    portfolio,
    addAsset,
    removeAsset,
    updateMultiplePrices,
    getPortfolioStats
  } = usePortfolio();

  // Fetch top cryptocurrencies
  const { data: cryptocurrencies, isLoading: cryptoLoading } = useQuery({
    queryKey: ['cryptocurrencies'],
    queryFn: () => cryptoApiService.getTopCryptocurrencies(50),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchIntervalInBackground: false,
    staleTime: 4 * 60 * 1000,
    retry: 1,
  });

  // Set Bitcoin as the default chart coin once crypto data is loaded
  useEffect(() => {
    if (!chartCoin && cryptocurrencies && cryptocurrencies.length > 0) {
      const bitcoin = cryptocurrencies.find(c => c.id === 'bitcoin');
      setChartCoin(bitcoin || cryptocurrencies[0]);
    }
  }, [cryptocurrencies, chartCoin]);

  // Fetch global market data
  const { data: globalData, isLoading: globalLoading } = useQuery({
    queryKey: ['global-market'],
    queryFn: () => cryptoApiService.getGlobalMarketData(),
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 4 * 60 * 1000,
    retry: 1,
  });

  // Fetch chart data for the selected coin
  const { data: marketChartData, isLoading: chartLoading } = useQuery({
    queryKey: ['market-chart', chartCoin?.id, chartTimeframe],
    queryFn: () => {
      if (!chartCoin) return Promise.resolve(undefined);
      return cryptoApiService.getMarketChart(chartCoin.id, chartTimeframe);
    },
    enabled: !!chartCoin, // Only run query if a coin is selected
    refetchInterval: chartTimeframe === '1' ? 3 * 60 * 1000 : 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: chartTimeframe === '1' ? 2 * 60 * 1000 : 4 * 60 * 1000,
    retry: 1,
  });

  // Update portfolio prices when crypto data changes
  useEffect(() => {
    if (cryptocurrencies && portfolio.length > 0) {
      const priceUpdates: Record<string, number> = {};
      
      portfolio.forEach(asset => {
        const crypto = cryptocurrencies.find(c => c.id === asset.id);
        if (crypto) {
          priceUpdates[asset.id] = crypto.current_price;
        }
      });
      
      if (Object.keys(priceUpdates).length > 0) {
        updateMultiplePrices(priceUpdates);
      }
    }
  }, [cryptocurrencies, portfolio, updateMultiplePrices]);

  const handleAddToPortfolio = (crypto: CryptoCurrency) => {
    setSelectedCrypto(crypto);
    setShowAddAssetModal(true);
  };

  const handleAddAsset = (assetData: any) => {
    addAsset(assetData);
  };

  const portfolioStats = getPortfolioStats();

  const globalOverviewData = globalData?.data
    ? {
        totalMarketCap: globalData.data.total_market_cap?.usd || 0,
        marketCapChange24h: globalData.data.market_cap_change_percentage_24h_usd || 0,
        totalVolume: globalData.data.total_volume?.usd || 0,
        bitcoinDominance: globalData.data.market_cap_percentage?.btc || 0,
      }
    : undefined;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-section">
            <DashboardMarketStats data={globalOverviewData} />
            <AiInsights />
          </div>
        );
        
      case 'markets':
        return (
          <div className="space-y-section">
            <MarketOverview 
              data={globalOverviewData}
            />
            
            <SectionSeparator variant="gradient" spacing="lg" withLabel="Live Market Data" />
            
            {cryptoLoading ? (
              <div className="flex justify-center py-12">
                <Loading text="Loading market data..." size="lg" />
              </div>
            ) : cryptocurrencies ? (
              <CryptoTable 
                cryptocurrencies={cryptocurrencies}
                onAddToPortfolio={handleAddToPortfolio}
              />
            ) : (
              <GlassCard className="p-12 text-center" elevated>
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-crypto-red/20 flex items-center justify-center">
                    <TrendingDown className="w-8 h-8 text-crypto-red" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-text-primary font-semibold text-lg mb-2">Failed to load market data</h3>
                    <p className="text-text-tertiary">Please check your internet connection and try again</p>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        );
        
      case 'portfolio':
        return (
          <div className="space-y-section">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">Portfolio Management</h1>
                <p className="text-text-tertiary">Track and manage your cryptocurrency investments</p>
              </div>
              <button
                onClick={() => setShowAddAssetModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Icon icon={Plus} size="sm" className="text-white" />
                <span>Add Asset</span>
              </button>
            </div>
            
            <SectionSeparator variant="gradient" spacing="md" />
            
            <PortfolioOverview 
              portfolio={portfolio}
              stats={portfolioStats}
              onRemoveAsset={removeAsset}
            />
          </div>
        );
        
      case 'charts':
        return (
          <div className="space-y-section">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Price Charts & Analysis</h1>
              <p className="text-text-tertiary">Interactive cryptocurrency price charts with technical analysis</p>
            </div>
            
            <SectionSeparator variant="gradient" spacing="md" />
            
            <CryptoChart
              coin={chartCoin}
              data={marketChartData}
              loading={chartLoading}
              timeframe={chartTimeframe}
              onTimeframeChange={setChartTimeframe}
              allCoins={cryptocurrencies || []}
              onCoinChange={setChartCoin}
            />
            
            <SectionSeparator variant="dots" spacing="lg" />
            
            {/* Additional charts section with progressive disclosure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-component">
              <CollapsibleSection
                title="Coming Soon"
                icon={<BarChart3 className="w-5 h-5" />}
                className=""
                contentClassName="space-y-4"
              >
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-glass-white/20 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-primary-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-text-primary font-semibold text-lg mb-2">Advanced Charts</h3>
                  <p className="text-text-tertiary text-sm">Ethereum, Altcoin charts, and technical indicators will be available in future updates.</p>
                </div>
              </CollapsibleSection>
              
              <CollapsibleSection
                title="Chart Features"
                icon={<Activity className="w-5 h-5" />}
                defaultExpanded
                className=""
                contentClassName="space-y-4"
              >
                <div className="space-y-3">
                  {[
                    // { icon: TrendingUp, title: 'Multiple Timeframes', desc: '1D, 7D, 30D, 90D, 1Y views' },
                    // { icon: Activity, title: 'Interactive Tooltips', desc: 'Hover for detailed price information' },
                    // { icon: BarChart3, title: 'Real-time Updates', desc: 'Live data with automatic refresh' },
                    // { icon: Wallet, title: 'Technical Indicators', desc: 'Coming soon: RSI, MACD, Moving Averages' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-glass-white/20 border border-glass-border/50">
                      <div className="p-2 rounded-lg bg-glass-white/30">
                        <Icon icon={feature.icon} size="sm" variant="info" />
                      </div>
                      <div>
                        <p className="text-text-secondary font-medium text-sm">{feature.title}</p>
                        <p className="text-text-muted text-xs">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <GlassCard className="p-12 text-center max-w-md" elevated>
              <div className="space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-glass-white/30 flex items-center justify-center">
                  <Icon icon={Activity} size="xl" variant="info" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary mb-3">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h2>
                  <p className="text-text-tertiary mb-4">This section is under development!</p>
                  <SectionSeparator variant="dots" spacing="sm" />
                  <p className="text-text-muted text-sm">Check back soon for exciting new features and improvements.</p>
                </div>
              </div>
            </GlassCard>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-900" style={dashboardBackground}>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm" />
      
      <div className="relative z-10 flex h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-section container-padding">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      
      <AddAssetModal 
        isOpen={showAddAssetModal}
        onClose={() => {
          setShowAddAssetModal(false);
          setSelectedCrypto(undefined);
        }}
        onAddAsset={handleAddAsset}
        selectedCrypto={selectedCrypto}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
