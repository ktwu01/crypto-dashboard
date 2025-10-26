export interface Env {
  CG_KEY?: string
}

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'Content-Type, Authorization',
  'access-control-allow-methods': 'GET, OPTIONS',
}

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json', ...CORS_HEADERS },
    ...init,
  })
}

async function proxyFetch(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return json({ error: true, status: res.status, body: text }, { status: res.status })
  }
  const data = await res.json()
  return json(data, { headers: { 'cache-control': 'max-age=10' } })
}

export default {
  async fetch(req: Request, env: Env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

    const url = new URL(req.url)
    const { pathname, searchParams } = url

    if (pathname === '/api/health') return json({ ok: true, ts: Date.now() })

    if (pathname === '/api/markets') {
      const vs = searchParams.get('vs') ?? 'usd'
      const page = searchParams.get('page') ?? '1'
      const perPage = searchParams.get('per_page') ?? '100'
      const target = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs}&order=market_cap_desc&per_page=${perPage}&page=${page}&price_change_percentage=1h,24h,7d`
      const headers: Record<string, string> = {}
      if (env.CG_KEY) headers['x-cg-demo-api-key'] = env.CG_KEY
      return proxyFetch(target, headers)
    }

    if (pathname === '/api/binance/klines') {
      const symbol = searchParams.get('symbol') ?? 'BTCUSDT'
      const interval = searchParams.get('interval') ?? '1m'
      const limit = searchParams.get('limit') ?? '500'
      const target = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      return proxyFetch(target)
    }

    return json({ error: 'Not found' }, { status: 404 })
  },
}
