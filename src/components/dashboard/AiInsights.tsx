import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import SectionSeparator from '@/components/ui/SectionSeparator';
import { fetchAiBriefing, AiBriefing } from '@/services/aiInsights';

const CACHE_STORAGE_KEY = 'ai-briefing-cache-v1';
const BRIEFING_TTL_MS = 60 * 60 * 1000; // Adjust to 24 * 60 * 60 * 1000 for daily refresh cadence
const RETRY_INTERVAL_MS = 2 * 60 * 1000;

interface CachedBriefing {
  data: AiBriefing;
  fetchedAt: number;
}

const AiInsights: React.FC = () => {
  const [briefing, setBriefing] = useState<AiBriefing | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retryTimeoutRef = useRef<number>();
  const refreshTimeoutRef = useRef<number>();
  const fetchLatestRef = useRef<() => void>();
  const hasMountedRef = useRef(false);
  const briefingRef = useRef<AiBriefing | null>(null);

  const clearTimer = useCallback((timerRef: React.MutableRefObject<number | undefined>) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const persistBriefing = useCallback((data: AiBriefing, fetchedAt: number) => {
    setBriefing(data);
    briefingRef.current = data;
    setLastFetchedAt(fetchedAt);
    setError(null);
    if (typeof window !== 'undefined') {
      const payload: CachedBriefing = { data, fetchedAt };
      window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
    }
  }, []);

  const scheduleRefresh = useCallback(
    (delay: number) => {
      clearTimer(refreshTimeoutRef);
      refreshTimeoutRef.current = window.setTimeout(() => {
        fetchLatestRef.current?.();
      }, delay);
    },
    [clearTimer]
  );

  const scheduleRetry = useCallback(() => {
    clearTimer(retryTimeoutRef);
    retryTimeoutRef.current = window.setTimeout(() => {
      fetchLatestRef.current?.();
    }, RETRY_INTERVAL_MS);
  }, [clearTimer]);

  const fetchLatest = useCallback(async () => {
    clearTimer(retryTimeoutRef);
    clearTimer(refreshTimeoutRef);
    setIsLoading(!briefingRef.current);
    try {
      const latest = await fetchAiBriefing();
      if (latest.isFallback) {
        throw new Error('fallback');
      }

      const timestamp = Date.now();
      persistBriefing(latest, timestamp);
      setIsLoading(false);
      scheduleRefresh(BRIEFING_TTL_MS);
    } catch (err) {
      if (!briefingRef.current) {
        setIsLoading(false);
      }
      setError('AI Insights are temporarily unavailable. Retrying in about 2 minutes.');
      scheduleRetry();
    }
  }, [persistBriefing, scheduleRefresh, scheduleRetry, clearTimer]);

  useEffect(() => {
    fetchLatestRef.current = fetchLatest;
  }, [fetchLatest]);

  useEffect(() => {
    briefingRef.current = briefing;
  }, [briefing]);

  useEffect(() => {
    if (hasMountedRef.current) {
      return;
    }
    hasMountedRef.current = true;

    const loadFromCache = () => {
      if (typeof window === 'undefined') {
        return;
      }
      const cachedRaw = window.localStorage.getItem(CACHE_STORAGE_KEY);
      if (!cachedRaw) {
        return;
      }

      try {
        const cached: CachedBriefing = JSON.parse(cachedRaw);
        if (!cached?.data?.facts || typeof cached.fetchedAt !== 'number') {
          return;
        }

        persistBriefing(cached.data, cached.fetchedAt);
        const age = Date.now() - cached.fetchedAt;
        if (age < BRIEFING_TTL_MS) {
          scheduleRefresh(BRIEFING_TTL_MS - age);
        } else {
          fetchLatestRef.current?.();
        }
      } catch (e) {
        console.warn('Failed to parse AI briefing cache', e);
      }
    };

    loadFromCache();

    if (!briefingRef.current) {
      fetchLatestRef.current?.();
    }

    return () => {
      clearTimer(retryTimeoutRef);
      clearTimer(refreshTimeoutRef);
    };
  }, [persistBriefing, scheduleRefresh, clearTimer]);

  const lastUpdatedLabel = useMemo(() => {
    if (!lastFetchedAt) return '—';
    return new Date(lastFetchedAt).toLocaleTimeString();
  }, [lastFetchedAt]);

  const formatUsd = useCallback((value: number, decimals = 0) => {
    if (!Number.isFinite(value)) return 'N/A';
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }, []);

  const formatPercent = useCallback((value: number) => {
    if (!Number.isFinite(value)) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }, []);

  const renderContent = () => {
    if (!briefing) {
      return null;
    }

    const { narrative, facts } = briefing;
    const { market, gainers, losers, notableMove } = facts;

    return (
      <div className="space-y-4">
        <GlassCard className="p-5 space-y-3 hover:translate-y-0 hover:scale-100">
          <p className="text-sm uppercase tracking-wide text-text-tertiary">Market Pulse</p>
          <p className="text-base text-text-secondary leading-relaxed">{narrative}</p>
        </GlassCard>

        <div className="grid gap-4 md:grid-cols-2">
          <GlassCard className="p-5 space-y-3 hover:translate-y-0 hover:scale-100">
            <p className="text-sm uppercase tracking-wide text-text-tertiary">Market Stats</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-center justify-between">
                <span>Total Market Cap</span>
                <span>{formatUsd(market.totalMarketCapUsd, 0)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Market Cap Change (24h)</span>
                <span>{formatPercent(market.marketCapChangePct)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Total Volume (24h)</span>
                <span>{formatUsd(market.totalVolumeUsd, 0)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>BTC Dominance</span>
                <span>{market.btcDominancePct.toFixed(1)}%</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Advancers vs Decliners</span>
                <span>
                  {market.advancing} / {market.declining}
                </span>
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-5 space-y-3 hover:translate-y-0 hover:scale-100">
            <p className="text-sm uppercase tracking-wide text-text-tertiary">Top Movers</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-crypto-green">
                  Gainers
                </p>
                <ul className="space-y-1 text-sm text-text-secondary">
                  {gainers.length ? (
                    gainers.map((mover) => (
                      <li key={`gainer-${mover.symbol}`} className="flex items-center justify-between">
                        <span>
                          {mover.name} <span className="text-text-muted">({mover.symbol})</span>
                        </span>
                        <span className="font-semibold text-crypto-green">
                          {formatPercent(mover.change24h)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-text-muted">No gainers available</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-crypto-red">
                  Losers
                </p>
                <ul className="space-y-1 text-sm text-text-secondary">
                  {losers.length ? (
                    losers.map((mover) => (
                      <li key={`loser-${mover.symbol}`} className="flex items-center justify-between">
                        <span>
                          {mover.name} <span className="text-text-muted">({mover.symbol})</span>
                        </span>
                        <span className="font-semibold text-crypto-red">
                          {formatPercent(mover.change24h)}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-text-muted">No losers available</li>
                  )}
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>

        {notableMove && (
          <GlassCard className="p-5 space-y-2 hover:translate-y-0 hover:scale-100">
            <p className="text-sm uppercase tracking-wide text-text-tertiary">Risk Watch</p>
            <p className="text-base text-text-secondary leading-relaxed">
              {notableMove.name} ({notableMove.symbol}) is posting the sharpest swing at{' '}
              {formatPercent(notableMove.change24h)}. Monitor correlated assets for spillover moves.
            </p>
          </GlassCard>
        )}
      </div>
    );
  };

  return (
    <GlassCard className="p-6 space-y-6" elevated>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">AI Insights</h2>
          <p className="text-sm text-text-tertiary">
            Lightweight daily briefing powered by live market data.
          </p>
        </div>

        <p className="text-xs text-text-muted">Updated {lastUpdatedLabel}</p>
      </div>

      <SectionSeparator variant="dots" spacing="sm" />

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {isLoading && !briefing ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`ai-briefing-skeleton-${index}`}
              className="rounded-xl border border-glass-border/60 bg-glass-white/10 p-5 animate-pulse"
            >
              <div className="mb-4 h-3 w-24 rounded bg-white/10" />
              <div className="mb-2 h-3 w-full rounded bg-white/10" />
              <div className="h-3 w-3/4 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        renderContent()
      )}
    </GlassCard>
  );
};

export default AiInsights;
