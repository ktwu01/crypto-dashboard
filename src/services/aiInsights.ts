import cryptoApiService, { CryptoCurrency } from './cryptoApi';
import { recordAiInsightsTelemetry } from '@/lib/telemetry';

export interface AiMover {
  name: string;
  symbol: string;
  change24h: number;
}

export interface AiMarketSnapshot {
  totalMarketCapUsd: number;
  marketCapChangePct: number;
  totalVolumeUsd: number;
  btcDominancePct: number;
  advancing: number;
  declining: number;
}

export interface AiFacts {
  market: AiMarketSnapshot;
  gainers: AiMover[];
  losers: AiMover[];
  notableMove?: AiMover;
}

export interface AiBriefing {
  generatedAt: string;
  narrative: string;
  facts: AiFacts;
  isFallback?: boolean;
}

const FALLBACK_NARRATIVE =
  'this most be due to our api provider limit ERR_FAILED 429 (Too Many Requests) u do not need do anything. just please have a cup of coffee and look back in 10mins';

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

const toMover = (coin: CryptoCurrency): AiMover => ({
  name: coin.name,
  symbol: coin.symbol.toUpperCase(),
  change24h: coin.price_change_percentage_24h ?? 0,
});

const pickTopMovers = (coins: CryptoCurrency[]) => {
  const sorted = [...coins].sort(
    (a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
  );
  const gainers = sorted.slice(0, 3).map(toMover);
  const losers = sorted.slice(-3).reverse().map(toMover);
  return { gainers, losers };
};

const buildMarketSnapshot = (
  coins: CryptoCurrency[],
  totalMarketCap: number,
  marketCapChange: number,
  totalVolume: number,
  btcDominance: number
): AiMarketSnapshot => {
  const advancing = coins.filter((coin) => (coin.price_change_percentage_24h ?? 0) >= 0).length;
  const declining = coins.length - advancing;

  return {
    totalMarketCapUsd: totalMarketCap,
    marketCapChangePct: marketCapChange,
    totalVolumeUsd: totalVolume,
    btcDominancePct: btcDominance,
    advancing,
    declining,
  };
};

const buildNarrative = (facts: AiFacts): string => {
  const { market, gainers, losers, notableMove } = facts;
  const parts: string[] = [];

  parts.push(
    `Global market cap sits at $${formatNumber(market.totalMarketCapUsd, 0)} (${formatPercent(
      market.marketCapChangePct
    )} in 24h) while total volume printed $${formatNumber(market.totalVolumeUsd, 0)}.`
  );

  parts.push(
    `Market breadth shows ${market.advancing} advancers vs ${market.declining} decliners across the tracked assets, with Bitcoin dominance near ${market.btcDominancePct.toFixed(
      1
    )}%.`
  );

  if (gainers.length && losers.length) {
    parts.push(
      `${gainers[0].name} (${gainers[0].symbol}) leads the day at ${formatPercent(
        gainers[0].change24h
      )} while ${losers[0].name} (${losers[0].symbol}) lags at ${formatPercent(losers[0].change24h)}.`
    );
  }

  if (notableMove) {
    parts.push(
      `Keep an eye on ${notableMove.name} (${notableMove.symbol}); its ${formatPercent(
        notableMove.change24h
      )} swing marks the largest move among tracked assets.`
    );
  }

  return parts.join(' ');
};

const fallbackFacts: AiFacts = {
  market: {
    totalMarketCapUsd: 0,
    marketCapChangePct: 0,
    totalVolumeUsd: 0,
    btcDominancePct: 0,
    advancing: 0,
    declining: 0,
  },
  gainers: [],
  losers: [],
};

const fallbackBriefing = (): AiBriefing => ({
  generatedAt: new Date().toISOString(),
  narrative: FALLBACK_NARRATIVE,
  facts: fallbackFacts,
  isFallback: true,
});

export async function fetchAiBriefing(): Promise<AiBriefing> {
  try {
    const [topCoins, globalData] = await Promise.all([
      cryptoApiService.getTopCryptocurrencies(20),
      cryptoApiService.getGlobalMarketData(),
    ]);

    if (!Array.isArray(topCoins) || !topCoins.length || !globalData?.data) {
      throw new Error('Insufficient data for AI briefing');
    }

    const totalMarketCap = globalData.data.total_market_cap?.usd ?? 0;
    const marketCapChange = globalData.data.market_cap_change_percentage_24h_usd ?? 0;
    const totalVolume = globalData.data.total_volume?.usd ?? 0;
    const btcDominance = globalData.data.market_cap_percentage?.btc ?? 0;

    const { gainers, losers } = pickTopMovers(topCoins);
    const market = buildMarketSnapshot(
      topCoins,
      totalMarketCap,
      marketCapChange,
      totalVolume,
      btcDominance
    );

    const notableMove = [...gainers, ...losers]
      .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))[0];

    const facts: AiFacts = {
      market,
      gainers,
      losers,
      notableMove,
    };

    const narrative = buildNarrative(facts);

    recordAiInsightsTelemetry(narrative, facts);

    return {
      generatedAt: new Date().toISOString(),
      narrative,
      facts,
      isFallback: false,
    };
  } catch (error) {
    console.error('Failed to generate AI briefing', error);
    const fallback = fallbackBriefing();
    recordAiInsightsTelemetry(fallback.narrative, fallback.facts);
    return fallback;
  }
}

export default {
  fetchAiBriefing,
};
