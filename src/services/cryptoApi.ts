import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: any | null;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

class CryptoApiService {
  private api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
  });

  async getTopCryptocurrencies(limit = 50): Promise<CryptoCurrency[]> {
    try {
      const response = await this.api.get(
        `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&locale=en`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching cryptocurrencies:', error);
      throw error;
    }
  }

  async getCryptocurrencyById(id: string): Promise<any> {
    try {
      const response = await this.api.get(`/coins/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cryptocurrency ${id}:`, error);
      throw error;
    }
  }

  async getMarketChart(
    id: string,
    days: string | number = '7',
    interval?: string
  ): Promise<MarketChartData> {
    try {
      let url = `/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
      if (interval) {
        url += `&interval=${interval}`;
      }
      
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching market chart for ${id}:`, error);
      throw error;
    }
  }

  async searchCryptocurrencies(query: string): Promise<any> {
    try {
      const response = await this.api.get(`/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
      throw error;
    }
  }

  async getGlobalMarketData(): Promise<any> {
    try {
      const response = await this.api.get('/global');
      return response.data;
    } catch (error) {
      console.error('Error fetching global market data:', error);
      throw error;
    }
  }

  async getTrendingCoins(): Promise<any> {
    try {
      const response = await this.api.get('/search/trending');
      return response.data.coins.slice(0, 3);
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      throw error;
    }
  }

  // Format currency values
  static formatCurrency(value: number, decimals = 2): string {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(decimals)}T`;
    }
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(decimals)}B`;
    }
    if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(decimals)}M`;
    }
    if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(decimals)}K`;
    }
    return `$${value.toFixed(decimals)}`;
  }

  // Format percentage changes
  static formatPercentage(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  // Get price change color class
  static getPriceChangeColor(change: number): string {
    return change >= 0 ? 'text-crypto-green' : 'text-crypto-red';
  }
}

export { CryptoApiService };
export default new CryptoApiService();