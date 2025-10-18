import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { MarketChartData } from '@/services/cryptoApi';
import { sma, rsi, macd } from 'technicalindicators';
import { Info } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BitcoinChartProps {
  data?: MarketChartData;
  loading?: boolean;
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
}

const BitcoinChart: React.FC<BitcoinChartProps> = ({ 
  data, 
  loading, 
  timeframe = '7',
  onTimeframeChange 
}) => {
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['price']);
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);
  const hasData = !!(data?.prices && data.prices.length > 0);

  const timeframes = [
    { label: '1D', value: '1' },
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '90D', value: '90' },
    { label: '1Y', value: '365' }
  ];

  const indicators = [
    { id: 'price', label: 'Price' },
    { id: 'sma', label: 'SMA' },
    { id: 'rsi', label: 'RSI' },
    { id: 'macd', label: 'MACD' },
  ];

  const indicatorInfo: Record<string, string> = {
    price: 'Price: Asset price in USD. You can hide it to focus on indicators.',
    sma: 'SMA (50): Simple Moving Average over the last 50 periods. Needs ≥50 data points.',
    rsi: 'RSI (14): Momentum oscillator (0-100). Needs ≥14 data points. Overbought >70, oversold <30.',
    macd: 'MACD (12,26,9): 12-EMA minus 26-EMA; Signal = 9-EMA of MACD. Needs ≥26 bars for MACD and ~35 for signal.',
  };

  const handleIndicatorToggle = (id: string) => {
    setActiveIndicators(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const chartData = useMemo(() => {
    if (!hasData) {
      return { labels: [], datasets: [] };
    }

    const prices = data!.prices.map(([, price]) => price);
    const labels = data!.prices.map(([timestamp]) => new Date(timestamp).toLocaleDateString());

    const datasets: any[] = [];

    if (activeIndicators.includes('price')) {
      datasets.push({
        label: 'Price',
        data: prices,
        borderColor: '#f7931a',
        backgroundColor: 'rgba(247, 147, 26, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        yAxisID: 'y',
      });
    }

    if (activeIndicators.includes('sma')) {
      const smaData = sma({ period: 50, values: prices });
      datasets.push({
        label: 'SMA (50)',
        data: [...Array(prices.length - smaData.length).fill(null), ...smaData],
        borderColor: '#3498db',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'y',
      });
    }

    if (activeIndicators.includes('rsi')) {
      const rsiData = rsi({ period: 14, values: prices });
      datasets.push({
        label: 'RSI (14)',
        data: [...Array(prices.length - rsiData.length).fill(null), ...rsiData],
        borderColor: '#9b59b6',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'yRsi',
      });
    }

    if (activeIndicators.includes('macd')) {
      const macdData = macd({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      });
      datasets.push({
        label: 'MACD',
        data: [...Array(prices.length - macdData.length).fill(null), ...macdData.map(d => d.MACD)],
        borderColor: '#e74c3c',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'yMacd',
      });
      datasets.push({
        label: 'Signal Line',
        data: [...Array(prices.length - macdData.length).fill(null), ...macdData.map(d => d.signal)],
        borderColor: '#2ecc71',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'yMacd',
      });
    }

    return { labels, datasets };
  }, [data, activeIndicators, hasData]);

  const showPriceOrSma = activeIndicators.includes('price') || activeIndicators.includes('sma');
  const showRsi = activeIndicators.includes('rsi');
  const showMacd = activeIndicators.includes('macd');

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#f7931a',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID === 'y') {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
              } else {
                label += context.parsed.y.toFixed(2);
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          maxTicksLimit: 6,
        },
      },
      y: {
        type: 'linear' as const,
        display: showPriceOrSma,
        position: 'left' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: function(value: any) {
            return `$${value.toLocaleString()}`;
          }
        },
      },
      yRsi: {
        type: 'linear' as const,
        display: showRsi,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
      yMacd: {
        type: 'linear' as const,
        display: showMacd,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
        beginAtZero: true,
        offset: true,
      },
    },
    interaction: {
      mode: 'index' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img 
            src="/images/crypto/clean_bitcoin_cryptocurrency_icon_logo.jpg" 
            alt="Bitcoin" 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h2 className="text-xl font-bold text-white">Bitcoin (BTC)</h2>
            <p className="text-white/60 text-sm">Price Chart</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onTimeframeChange && timeframes.map((tf) => (
            <motion.button
              key={tf.value}
              onClick={() => onTimeframeChange?.(tf.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf.value
                  ? 'bg-primary-500 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tf.label}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-white/60 text-sm font-medium">Indicators:</span>
        {indicators.map(indicator => (
          <div key={indicator.id} className="relative inline-flex items-center space-x-1">
            <button
              onClick={() => handleIndicatorToggle(indicator.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeIndicators.includes(indicator.id)
                  ? 'bg-primary-500 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {indicator.label}
            </button>
            <button
              aria-label={`${indicator.label} info`}
              onClick={() => setOpenInfoId(prev => (prev === indicator.id ? null : indicator.id))}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
              title={indicatorInfo[indicator.id]}
            >
              <Info className="w-4 h-4" />
            </button>
            {openInfoId === indicator.id && (
              <div className="absolute z-10 top-9 left-0 w-64 p-3 rounded-lg bg-black/80 border border-white/10 shadow-lg">
                <p className="text-white/80 text-xs leading-snug">{indicatorInfo[indicator.id]}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white/70 text-lg">∅</span>
              </div>
              <p className="text-white/80 text-sm">No chart data available</p>
              <p className="text-white/50 text-xs">Check your connection or try a different timeframe</p>
            </div>
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </GlassCard>
  );
};

export default BitcoinChart;