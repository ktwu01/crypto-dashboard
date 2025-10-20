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
  ChartOptions,
  BarElement,
  BarController,
  LineController
} from 'chart.js';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { MarketChartData, CryptoCurrency } from '@/services/cryptoApi';
import { sma, rsi, macd, ema } from 'technicalindicators';
import { Info, ChevronsUpDown } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CryptoChartProps {
  coin?: CryptoCurrency;
  allCoins: CryptoCurrency[];
  onCoinChange: (coin: CryptoCurrency) => void;
  data?: MarketChartData;
  loading?: boolean;
  timeframe?: string;
  onTimeframeChange?: (timeframe: string) => void;
}

const CryptoChart: React.FC<CryptoChartProps> = ({ 
  coin,
  allCoins,
  onCoinChange,
  data, 
  loading, 
  timeframe = '7',
  onTimeframeChange 
}) => {
  const [activeIndicators, setActiveIndicators] = useState<string[]>(['price']);
  const [openInfoId, setOpenInfoId] = useState<string | null>(null);
  const [isCoinSelectorOpen, setIsCoinSelectorOpen] = useState(false);
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
    { id: 'ema', label: 'EMA' },
    { id: 'rsi', label: 'RSI' },
    { id: 'macd', label: 'MACD' },
  ];

  const indicatorInfo: Record<string, string> = {
    price: 'Price: Asset price in USD. You can hide it to focus on indicators.',
    sma: 'SMA (50): Simple Moving Average over the last 50 periods. Needs ≥50 data points.',
    ema: 'EMA (50): Exponential Moving Average over the last 50 periods. More responsive to recent price changes than SMA. Needs ≥50 data points.',
    rsi: 'RSI (14): Momentum oscillator (0-100). Needs ≥14 data points. Overbought >70, oversold <30.',
    macd: 'MACD (12,26,9): Trend-following momentum. Not predictive. MACD (Blue line) = 12-EMA − 26-EMA; Signal (Green line) = 9-EMA of MACD. Histogram = MACD − Signal: Green (>0) shows bullish momentum, Red (<0) bearish. Growing bars = accelerating momentum; shrinking bars = waning momentum; crossing 0 = momentum flip.',
  };

// 这玩意看起来一点用处也没有啊。是不是大家都已经知道了，所以市场不符合这个规矩了？正如唐纳德·T·坎贝尔所说：“任何定量社会指标被用于社会决策的次数越多，它就越容易受到腐败压力的影响，并且越容易扭曲和破坏它旨在监测的社会过程。
// MACD (12,26,9)：趋势跟随型动量，非预测。MACD=12EMA−26EMA；Signal=MACD的9EMA；直方图=MACD−Signal。
// 用法：仅在趋势市作为动量/方向参考，结合位置与结构；多周期过滤（如仅顺200EMA方向）；等收盘确认金叉/死叉；直方图变短=动量衰减，跨越0=动量翻转；价格-指标背离在关键位更可信。务必配合风险管理与回测验证。

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
        borderColor: coin?.price_change_percentage_24h && coin.price_change_percentage_24h > 0 ? '#2ecc71' : '#e74c3c',
        backgroundColor: coin?.price_change_percentage_24h && coin.price_change_percentage_24h > 0 ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
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

    if (activeIndicators.includes('ema')) {
      const emaData = ema({ period: 50, values: prices });
      datasets.push({
        label: 'EMA (50)',
        data: [...Array(prices.length - emaData.length).fill(null), ...emaData],
        borderColor: '#1abc9c',
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
      const padCount = prices.length - macdData.length;
      const macdLine = [...Array(padCount).fill(null), ...macdData.map(d => d.MACD)];
      const signalLine = [...Array(padCount).fill(null), ...macdData.map(d => d.signal)];
      const histData = [...Array(padCount).fill(null), ...macdData.map(d => d.histogram ?? 0)];

      // Colors for histogram: green above zero, red below zero, transparent for nulls
      const greenFill = 'rgba(46, 204, 113, 0.5)';
      const redFill = 'rgba(231, 76, 60, 0.5)';
      const transparent = 'rgba(0,0,0,0)';
      const histBg = histData.map(v => (v === null ? transparent : (v >= 0 ? greenFill : redFill)));
      const histBorder = histBg; // Keep border same as fill for clarity

      datasets.push({
        label: 'MACD',
        data: macdLine,
        borderColor: '#3498db',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'yMacd',
      });
      datasets.push({
        label: 'Signal Line',
        data: signalLine,
        borderColor: '#2ecc71',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        yAxisID: 'yMacd',
      });
      datasets.push({
        label: 'Histogram',
        data: histData,
        backgroundColor: histBg,
        borderColor: histBorder,
        borderWidth: 1,
        yAxisID: 'yMacd',
        type: 'bar',
      });
    }

    return { labels, datasets };
  }, [data, activeIndicators, hasData, coin]);

  const showPriceOrMovingAverage = activeIndicators.includes('price') || activeIndicators.includes('sma') || activeIndicators.includes('ema');
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
        borderColor: coin?.price_change_percentage_24h && coin.price_change_percentage_24h > 0 ? '#2ecc71' : '#e74c3c',
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
              if (context.dataset.label === 'Histogram') {
                label += context.parsed.y.toFixed(4);
              } else if (context.dataset.yAxisID === 'y') {
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
        display: showPriceOrMovingAverage,
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

  if (!coin) {
    return (
      <GlassCard className="p-6 h-[488px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <img 
            src={coin.image}
            alt={coin.name} 
            className="w-10 h-10 rounded-full"
          />
          <div className="relative">
            <button
              onClick={() => setIsCoinSelectorOpen(!isCoinSelectorOpen)}
              className="flex items-center justify-between w-48 px-3 py-2 text-white bg-white/5 rounded-lg hover:bg-white/10"
            >
              <span className="font-medium">{coin.name}</span>
              <ChevronsUpDown className="w-4 h-4 text-white/60" />
            </button>
            {isCoinSelectorOpen && (
              <div className="absolute z-20 w-48 mt-1 bg-dark-800 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {allCoins.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onCoinChange(c);
                      setIsCoinSelectorOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center space-x-2"
                  >
                    <img src={c.image} alt={c.name} className="w-5 h-5 rounded-full" />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="text-white/60 text-sm mt-2">Price Chart</p>
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

export default CryptoChart;
