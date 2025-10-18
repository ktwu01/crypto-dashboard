# Project Plan: Crypto Analysis Dashboard

This document outlines the development plan for the Crypto Analysis Dashboard, based on initial ideas.

## Background and Motivation

The goal is to build a comprehensive crypto analysis dashboard. The initial version can fetch data, but we need to expand its capabilities to provide more immediate value to the user, introduce personalization, and leverage AI for unique insights.

The current implementation includes:
- Dashboard with Market Overview, Trending Coins, and Gainers/Losers features
- Markets view with comprehensive crypto table
- Portfolio management capabilities
- Bitcoin price charting with multiple timeframes

## Key Challenges and Analysis

The initial version of the application had several critical infrastructure issues, including a dependency on a development-only proxy, a lack of environment configuration, and unsafe data access patterns that could cause runtime crashes. These issues have been fully resolved in Phase 0.

## Key Challenges and Analysis (Planner)
- MACD Histogram color bug: Current implementation supplies per-bar colors only for the unpadded MACD array, while the dataset `data` is padded with leading nulls to align with labels. This length mismatch causes Chart.js to reuse colors, leading to mixed green/red even when all visible bars are positive. Best practice is sign-based coloring: green above zero, red below zero, with color arrays matching the full dataset length (including padding with transparent for nulls).
- Optional enhancement: Differentiate acceleration/deceleration by using lighter/darker shades based on histogram slope (delta). Common but not strictly required.

## High-level Task Breakdown

### Phase 0: Critical Infrastructure Fixes (COMPLETED)
- The application's core infrastructure has been hardened. This involved removing the unsafe Vite development proxy, implementing environment variable configuration for the API, and adding comprehensive null-safety checks to prevent crashes from unexpected API data. This ensures the application is stable, secure, and behaves consistently across development, preview, and production environments.

### Phase 1: Enhance Core Data Features (COMPLETED)
- Core features like "Trending Coins" and "Gainers & Losers" have been implemented and are now robust and null-safe.

### Phase 2: Introduce Personalization and Technical Analysis

- **Challenge**: The application currently only displays real-time data. To build personalized features like a watchlist or a detailed portfolio analysis, we need to store user-specific data that persists between sessions. A full backend database is overkill for this stage.
- **Solution**: We will use the browser's `localStorage` to store user portfolio and watchlist data. This approach is simple, client-only, and effective for persisting data on the user's device without needing a backend. It addresses the need for a "temporary database" as suggested.

**Task 2.7.5: Add EMA Indicator (Completed)**
- **Success Criteria**: Add an EMA (Exponential Moving Average, e.g., 50-period) as a selectable indicator, similar to the existing SMA. This includes a UI toggle, rendering the line on the chart, and adding an explanatory tooltip. The EMA should be more responsive to recent price changes than the SMA.

**Task 2.8: Chart Coin Selector (BTC → selectable) (Completed)**
- **Success Criteria**: Add a simple selector (dropdown or search) to choose the coin id (e.g., BTC, ETH). Chart updates data and indicators for the selected coin, preserving timeframe and indicator toggles.

==== Stop here waiting for user approval before next task. Without user approval, do not do git commit or push. ====

### Phase 3: AI-Powered Insights and Growth Strategy

- **AI-Powered Daily Briefing:** Use an LLM to generate a daily summary of market trends. This should be added in the `AI Insights` portal (Create A new portal) As several cells.
- **User Accounts & Personalization:** Develop a user account system.
- **Explore SaaS Model:** Investigate a potential SaaS subscription model.

 
## Project Status Board

- [x] **Task 2.1: Implement Local Storage Service for Portfolio** - *COMPLETED*: `usePortfolio` persists to `localStorage`.
- [x] **Task 2.2: Refactor Portfolio Components to Use Local Storage** - *COMPLETED*: Components use the centralized storage logic.
- [x] **Task 2.3: Enhance Portfolio with Historical Data (Profit/Loss)** - *COMPLETED*: P&L derived from `purchasePrice`.
- [x] **Task 2.4: Technical Analysis Indicators** - *COMPLETED*: SMA, RSI, and MACD with toggles.
- [x] **Task 2.5: Ensure Charts Render Without API Data (Fallback + Empty-State)** - *COMPLETED*: Clear empty-state overlay when data missing.
- [x] **Task 2.6: Indicator Info Tooltips (SMA/RSI/MACD)**
- [x] **Task 2.7: Price Visibility Toggle (Indicators-only Mode)**
- [x] **Task 2.8: Chart Coin Selector (BTC → selectable)**
- [x] Task 2.9 The "coin selector" should be placed above "Price Chart": That means the coin selector button should be replacing the current "coin name" button. This allows it to be more simple.
- [x] **Task 2.8.1: Fix MACD Histogram Colors (sign-based)**

### Phase 1
- [ ] On-Chain Data Integration

### Phase 2
- [ ] Customizable Watchlist

### Phase 3
- [ ] AI-Powered Daily Briefing
- [ ] User Accounts & Personalization
- [ ] Explore SaaS Model

## Current Status / Progress Tracking

**Build/Lint**:
- `pnpm build`: succeeds
- Lint: no issues in `src/components/charts/BitcoinChart.tsx`

**Next**:
- Optional enhancements (2.8.2 shade-by-momentum, 2.8.3 zero baseline) are deferred for now.

### Executor's Feedback or Assistance Requests
- **Task 2.8 is complete.** The chart now features a coin selector, allowing you to view the chart for any of the top 50 cryptocurrencies. Please test this feature.
- **Task 2.8.1 is complete.** MACD histogram colors now follow sign-based coloring with padded color arrays to prevent reuse artifacts. Optional enhancements are postponed.
- I was unable to commit the previous changes as requested because the project is not a git repository. Please advise if you would like me to initialize one.

### Lessons
*   **Lifting state up** is a crucial React pattern. By moving the `chartCoin` state to the `App` component, we could easily control the `CryptoChart` from a central location and keep data fetching logic clean.
*   When a component's responsibility grows (from showing just Bitcoin to any crypto), it's best to **rename the component** (`BitcoinChart` → `CryptoChart`) to accurately reflect its purpose. This improves code clarity.
*   For UI elements like selectors, it's effective to start with a simple implementation (like the dropdown I added) and then enhance it later if needed (e.g., adding a search filter). This follows the principle of iterative development.
*   Added a new dependency `lucide-react` for the `ChevronsUpDown` icon. Remember to install it if you haven't already (`pnpm add lucide-react`).

### Architecture & Security Lessons ⭐ CRITICAL
- **NEVER rely on Vite's `server.proxy` for production.** It is a dev-only tool and creates environment-specific bugs.
- **ALWAYS use environment variables for API configuration** (`VITE_*` prefix). This ensures code works consistently across dev, preview, and production.
- **Public APIs with CORS support (like CoinGecko) should be called directly from the frontend.** This is simpler and safer than a proxy.
- **Never trust API data.** Always use defensive coding practices like optional chaining (`?.`), nullish coalescing (`??`), and explicit checks to prevent runtime crashes from missing or malformed data.
- **Test in a production-like environment (`pnpm preview`), not just development (`pnpm dev`).** This catches issues related to dev-only tooling.
- **Chart.js plugins must be explicitly imported and registered** to enable features like chart fills or time-series scales.

### Dependency Management Lessons ⭐ CRITICAL
- **ALWAYS add dependencies to `package.json`, not just install them locally.** Running `pnpm install package-name` must also update `package.json` (use `-S` flag if needed).
- **Verify that new dependencies appear in `package.json` after installation.** If they don't, they won't be installed when cloning the repo or in CI/CD pipelines.
- **Build and test after adding dependencies to ensure they're correctly wired.** Use `pnpm build` to catch missing imports or configuration issues.
- **Libraries must be imported in code AND present in package.json.** Only having the import without the dependency entry will fail in production builds.

### API & Build Lessons

- A `429 Too Many Requests` error from an API can manifest as a CORS error in the browser.
- `npm run build` is for creating a production build. `pnpm dev` (or `npm run dev`) must be used to run the local development server and see changes live
- **If dev mode works but preview mode doesn't, you're likely using dev-only features (like proxy)**

### Code Quality Lessons  
- Always add defensive null/undefined checks when accessing API response properties
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Components that depend on API data should have loading, error, and empty states
- TypeScript compilation success does NOT guarantee runtime safety with external data

### Testing Lessons
- Test both development mode (`pnpm dev`) and preview mode (`pnpm preview`)
- Preview mode is closest to production environment - if it fails there, it will fail in prod
- Verify error states by testing with failed/empty API responses
- Build success ≠ runtime success - always test in the browser after building
- **Use network throttling and offline mode in DevTools to test error handling**

### Documentation Best Practices ⭐
- **Separate user-facing documentation from technical deployment guides**
  - README.md: Project overview, features, quick start, basic usage
  - DEPLOYMENT.md: Platform-specific deployment instructions, configuration details
  - CONTRIBUTING.md: Guidelines for contributors (when applicable)
- Keep README.md concise and welcoming to new users
- Include badges, emojis, and clear sections for better readability
- Always provide example environment variables and configuration
- Link to additional documentation from README for deeper topics

### UI/UX Lessons
- Always provide a visible empty-state for charts; avoid silent blank canvases.

### Indicators Lessons
- Indicators require warm-up periods: SMA50 ≥50 bars; RSI14 ≥14 bars; MACD(12,26,9) needs ≥26 bars for MACD and ~35 for signal. Explain this in-tool via info icons.

### Chart Scaling Lessons
- Use separate axes for different units/magnitudes: Price/SMA on left (USD), RSI fixed 0–100 on right, MACD/Signal on a dedicated right axis.