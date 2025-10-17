import React from 'react';
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
  const timeframes = [
    { label: '1D', value: '1' },
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '90D', value: '90' },
    { label: '1Y', value: '365' }
  ];

  const formatChartData = () => {
    if (!data?.prices) {
      // Mock data for demonstration
      const mockData = Array.from({ length: 24 }, (_, i) => {
        const price = 45000 + Math.sin(i / 3) * 2000 + Math.random() * 1000;
        return price;
      });
      
      return {
        labels: mockData.map((_, i) => `${i}:00`),
        datasets: [
          {
            label: 'Bitcoin Price',
            data: mockData,
            borderColor: '#f7931a',
            backgroundColor: 'rgba(247, 147, 26, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
          }
        ]
      };
    }

    const prices = data.prices.slice(-100); // Last 100 data points
    
    return {
      labels: prices.map(([timestamp]) => 
        new Date(timestamp).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Bitcoin Price',
          data: prices.map(([, price]) => price),
          borderColor: '#f7931a',
          backgroundColor: 'rgba(247, 147, 26, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
        }
      ]
    };
  };

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
        displayColors: false,
        callbacks: {
          title: (context) => {
            return `Bitcoin Price`;
          },
          label: (context) => {
            return `$${context.parsed.y.toLocaleString()}`;
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
        display: true,
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
    },
    interaction: {
      mode: 'nearest' as const,
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
          {timeframes.map((tf) => (
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
      
      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <Line data={formatChartData()} options={options} />
        )}
      </div>
    </GlassCard>
  );
};

export default BitcoinChart;