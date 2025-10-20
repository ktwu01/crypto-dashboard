import axios, { AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.coingecko.com/api/v3';
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

const STORAGE_PREFIX = 'crypto-cache-';

const isBrowser = typeof window !== 'undefined';

function buildStorageKey(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

function readStorage<T>(key: string): CacheEntry<T> | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(buildStorageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (parsed?.data && typeof parsed.timestamp === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: CacheEntry<T>) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(buildStorageKey(key), JSON.stringify(value));
  } catch {
    // Swallow storage quota errors silently.
  }
}

function setCache<T>(key: string, data: T) {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  writeStorage(key, entry);
  return entry;
}

function getCache<T>(key: string, ttl: number): T | null {
  const now = Date.now();
  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memoryEntry && now - memoryEntry.timestamp < ttl) {
    return memoryEntry.data;
  }

  const stored = readStorage<T>(key);
  if (stored) {
    memoryCache.set(key, stored);
    if (now - stored.timestamp < ttl) {
      return stored.data;
    }
  }
  return null;
}

function getStaleCache<T>(key: string): T | null {
  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memoryEntry) {
    return memoryEntry.data;
  }
  const stored = readStorage<T>(key);
  if (stored) {
    memoryCache.set(key, stored);
    return stored.data;
  }
  return null;
}

async function fetchWithCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = getCache<T>(key, ttl);
  if (cached) {
    return cached;
  }

  if (inFlight.has(key)) {
    return inFlight.get(key) as Promise<T>;
  }

  const requestPromise = fetcher()
    .then((data) => {
      setCache(key, data);
      inFlight.delete(key);
      return data;
    })
    .catch((error) => {
      inFlight.delete(key);
      const fallback = getStaleCache<T>(key);
      if (fallback) {
        return fallback;
      }
      throw error;
    });

  inFlight.set(key, requestPromise);
  return requestPromise;
}

const CACHE_TTL = {
  TOP_COINS: 5 * 60 * 1000, // 5 minutes
  GLOBAL: 5 * 60 * 1000,
  TRENDING: 10 * 60 * 1000,
  GAINERS: 5 * 60 * 1000,
  MARKET_CHART: 2 * 60 * 1000,
};

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
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });

    this.api.interceptors.request.use((config) => {
      if (API_KEY) {
        config.params = {
          ...(config.params ?? {}),
          x_cg_demo_api_key: API_KEY,
        };
      }
      return config;
    });
  }

  async getTopCryptocurrencies(limit = 50): Promise<CryptoCurrency[]> {
    const cacheKey = `top-coins-${limit}`;
    return fetchWithCache<CryptoCurrency[]>(cacheKey, CACHE_TTL.TOP_COINS, async () => {
      const response = await this.api.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: true,
          locale: 'en',
        },
      });
      return response.data;
    });
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
    const cacheKey = `market-chart-${id}-${days}-${interval ?? 'default'}`;
    return fetchWithCache<MarketChartData>(cacheKey, CACHE_TTL.MARKET_CHART, async () => {
      const response = await this.api.get(`/coins/${id}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days,
          ...(interval ? { interval } : {}),
        },
      });
      return response.data;
    });
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
    return fetchWithCache<any>('global-market', CACHE_TTL.GLOBAL, async () => {
      const response = await this.api.get('/global');
      return response.data;
    });
  }

  async getTrendingCoins(): Promise<any> {
    return fetchWithCache<any>('trending-coins', CACHE_TTL.TRENDING, async () => {
      const response = await this.api.get('/search/trending');
      return response.data.coins.slice(0, 3);
    });
  }

  async getGainersAndLosers(): Promise<{ gainers: CryptoCurrency[]; losers: CryptoCurrency[] }> {
    const cacheKey = 'gainers-losers';
    return fetchWithCache<{ gainers: CryptoCurrency[]; losers: CryptoCurrency[] }>(
      cacheKey,
      CACHE_TTL.GAINERS,
      async () => {
        const response = await this.api.get('/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 250,
            page: 1,
            sparkline: false,
            locale: 'en',
          },
        });

        const coins: CryptoCurrency[] = response.data;

        const sortedByChange = [...coins].sort(
          (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
        );

        const gainers = sortedByChange.slice(0, 5);
        const losers = sortedByChange.slice(-5).reverse();

        return { gainers, losers };
      }
    );
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
