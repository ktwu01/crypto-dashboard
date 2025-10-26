export async function api<T>(path: string, init?: RequestInit) {
  const res = await fetch(`/api${path}`, { ...init })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text}`)
  }
  return (await res.json()) as T
}

export type MarketItem = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
}

export function getMarkets(vs = 'usd', page = 1, perPage = 100) {
  return api<MarketItem[]>(`/markets?vs=${vs}&page=${page}&per_page=${perPage}`)
}

export type Kline = [number, string, string, string, string, string, number, string, number, string, string, string]

export function getBinanceKlines(symbol = 'BTCUSDT', interval = '1m', limit = 500) {
  const sp = new URLSearchParams({ symbol, interval, limit: String(limit) })
  return api<Kline[]>(`/binance/klines?${sp.toString()}`)
}
