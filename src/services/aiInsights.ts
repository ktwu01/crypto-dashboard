import cryptoApiService, { CryptoCurrency } from './cryptoApi';

export interface AiBriefingCell {
  id: string;
  title: string;
  body: string;
}

export interface AiBriefing {
  generatedAt: string;
  cells: AiBriefingCell[];
  isFallback?: boolean;
}

const formatNumber = (value: number, decimals = 2) => {
  if (!Number.isFinite(value)) return 'N/A';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatPercent = (value: number) => {
  if (!Number.isFinite(value)) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const pickTopMovers = (coins: CryptoCurrency[]) => {
  const sorted = [...coins].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
  );
  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();
  return { gainers, losers };
};

const describeCoin = (coin: CryptoCurrency) => {
  const move = formatPercent(coin.price_change_percentage_24h ?? 0);
  return `${coin.name} (${coin.symbol.toUpperCase()}) ${move}`;
};

const fallbackBriefing = (): AiBriefing => ({
  generatedAt: new Date().toISOString(),
  cells: [
    {
      id: 'market-pulse',
      title: 'Market Pulse',
      body: 'Market data is temporarily unavailable. We will refresh the briefing as soon as live data returns.',
    },
    {
      id: 'movers',
      title: 'Top Movers',
      body: 'Unable to identify top movers right now. Please check back shortly.',
    },
    {
      id: 'risk-watch',
      title: 'Risk Watch',
      body: 'No risk signals while data is offline. Consider refreshing in a few minutes.',
    },
  ],
  isFallback: true,
});

export async function fetchAiBriefing(): Promise<AiBriefing> {
  try {
    const [topCoins, globalData] = await Promise.all([
      cryptoApiService.getTopCryptocurrencies(10),
      cryptoApiService.getGlobalMarketData(),
    ]);

    const totalMarketCap = globalData?.data?.total_market_cap?.usd ?? 0;
    const marketCapChange = globalData?.data?.market_cap_change_percentage_24h_usd ?? 0;
    const totalVolume = globalData?.data?.total_volume?.usd ?? 0;
    const btcDominance = globalData?.data?.market_cap_percentage?.btc ?? 0;

    const { gainers, losers } = pickTopMovers(topCoins);

    const marketPulse = [
      `Global market cap sits at $${formatNumber(totalMarketCap, 0)} with a ${formatPercent(
        marketCapChange
      )} move over the last 24h.`,
      `24h volume came in at $${formatNumber(totalVolume, 0)}, while Bitcoin dominance is holding near ${btcDominance.toFixed(
        1
      )}%.`,
    ].join(' ');

    const movers = [
      `Leaders: ${gainers.map(describeCoin).join(', ')}.`,
      `Laggards: ${losers.map(describeCoin).join(', ')}.`,
    ].join(' ');

    const riskCoin = [...gainers, ...losers].sort(
      (a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h)
    )[0];
    const riskWatch = riskCoin
      ? `${riskCoin.name} is seeing the sharpest swing at ${formatPercent(
          riskCoin.price_change_percentage_24h ?? 0
        )}. Expect elevated volatility across correlated alts.`
      : 'No outsized volatility detected among top assets.';

    return {
      generatedAt: new Date().toISOString(),
      cells: [
        { id: 'market-pulse', title: 'Market Pulse', body: marketPulse },
        { id: 'movers', title: 'Top Movers', body: movers },
        { id: 'risk-watch', title: 'Risk Watch', body: riskWatch },
      ],
      isFallback: false,
    };
  } catch (error) {
    console.error('Failed to generate AI briefing', error);
    return fallbackBriefing();
  }
}

export default {
  fetchAiBriefing,
};
