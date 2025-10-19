# Data Architecture Overview

This document summarizes how the crypto dashboard fetches, stores, and derives data as of the current implementation. It is meant to guide future enhancements by making the existing data flows and algorithms explicit.

## External Data Sources

- **CoinGecko REST API** (`src/services/cryptoApi.ts`): Primary source for market-wide metrics, individual coin quotes, historical chart data, trending lists, and gainers/losers. All requests are made from the client using the configured `VITE_API_BASE_URL`.
- **LLM Briefing Service (placeholder)**: The `fetchAiBriefing` helper currently synthesizes an AI briefing locally from CoinGecko responses. It represents the contract that a future server-side LLM integration must satisfy (returning structured `{title, body}` cells).

## Client-Side Storage

- **React Query in-memory cache**: Handles short-lived caching for market, portfolio, and chart queries with aggressive refresh intervals (60–120 seconds) to keep data fresh without manual reloads.
- **`localStorage` caches**:
  - `usePortfolio` hook keeps the user’s holdings, purchase prices, and related metadata so portfolios persist between sessions.
  - `AI Insights` module saves the last successful briefing (`ai-briefing-cache-v1`) alongside its fetch timestamp. The cached result survives page reloads and prevents repeated API calls inside the TTL window.

## Derived Data & Algorithms

- **AI Insight Dataset** (`src/services/aiInsights.ts`): Every refresh produces a canonical JSON payload consisting of:
  - `market`: total market cap (USD), 24h market-cap delta %, 24h volume (USD), BTC dominance %, and counts of advancing/declining assets across the sampled universe.
  - `gainers` / `losers`: top three movers by 24h % change, each containing `{ name, symbol, change24h }`.
  - `notableMove`: the single largest absolute mover across gainers/losers, used for “Risk Watch”.
  - `narrative`: deterministic, template-based commentary derived strictly from the fields above.
  The dataset is cached with the briefing under the `ai-briefing-cache-v1` key, honouring the one-refresh-per-TTL rule. Each emission is also hashed and appended to a lightweight telemetry buffer (`telemetry:ai-insights-history` in `localStorage`) so future LLM outputs can be audited against the canonical facts. A repository-level `telemetry/` folder is git-ignored for any exported logs.

- **AI Briefing Refresh Loop** (`src/components/dashboard/AiInsights.tsx`):
  1. On mount, load any cached briefing. If it is younger than the configured TTL (1 hour by default), render it immediately and schedule the next refresh for the moment the TTL expires.
  2. If no valid cache exists, enter a retry loop: attempt a fetch, and if it fails or returns the fallback payload, retry every 2 minutes until the first success.
  3. After the first success, persist the payload, update the timestamp label, and do not trigger further requests until the TTL elapses.
  4. When fetches fail, the UI continues to display the last good briefing while background retries continue; the fallback copy is never cached.
  - **Configuration knobs**: Change `BRIEFING_TTL_MS` to adjust the cadence (e.g., switch to 24 hours) and `RETRY_INTERVAL_MS` to tune the retry delay.

- **Portfolio Normalization** (`src/hooks/usePortfolio.ts` + `src/App.tsx`):
  - Portfolio records are stored with `id`, `quantity`, `purchasePrice`, and timestamps.
  - Live market prices from `getTopCryptocurrencies` are fanned out into the `usePortfolio` hook via `updateMultiplePrices` each time the top-50 quote list refreshes.
  - Aggregations: total portfolio value, total cost basis, unrealized profit/loss, and percentage gain are computed on demand for display components.

- **Market & Chart Data**:
  - `useQuery` fetches market chart series (`getMarketChart`) keyed by coin + timeframe, enabling fast coin switching without redundant requests.
  - Chart indicators (SMA, EMA, RSI, MACD) are derived client-side from the fetched price arrays. Warm-up periods are enforced before rendering to avoid misleading readings.

- **Dashboard Stat Tiles** (`DashboardMarketStats.tsx`):
  - Renders the four primary metrics (market cap, 24h volume, BTC dominance, active cryptos) using the latest global snapshot. When live data is missing, the tiles fall back to baseline placeholder values.

## Future Considerations

- Replace the local AI summarizer with a true LLM service that adheres to the same JSON contract. Ensure the new integration respects the single-refresh-per-TTL design.
- Centralize cache keys and TTL settings (e.g., export from a dedicated config module) if additional long-lived caches are introduced.
- Document any server-side persistence (e.g., SaaS user profiles) here once implemented so the client/server boundaries remain clear.
