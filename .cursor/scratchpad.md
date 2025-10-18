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

## High-level Task Breakdown

### Phase 0: Critical Infrastructure Fixes (COMPLETED)
- The application's core infrastructure has been hardened. This involved removing the unsafe Vite development proxy, implementing environment variable configuration for the API, and adding comprehensive null-safety checks to prevent crashes from unexpected API data. This ensures the application is stable, secure, and behaves consistently across development, preview, and production environments.

### Phase 1: Enhance Core Data Features (COMPLETED)
- Core features like "Trending Coins" and "Gainers & Losers" have been implemented and are now robust and null-safe.

### Phase 2: Introduce Personalization and Technical Analysis

- **Challenge**: The application currently only displays real-time data. To build personalized features like a watchlist or a detailed portfolio analysis, we need to store user-specific data that persists between sessions. A full backend database is overkill for this stage.
- **Solution**: We will use the browser's `localStorage` to store user portfolio and watchlist data. This approach is simple, client-only, and effective for persisting data on the user's device without needing a backend. It addresses the need for a "temporary database" as suggested.

**Task 2.1: Implement Local Storage Service for Portfolio**
- **Success Criteria**: A reusable hook or service (`usePortfolioStorage`) is created to abstract `localStorage` logic (saving, loading, updating portfolio data). The data should persist after a page refresh.
- **Sub-tasks**:
  1. Define a clear data structure for portfolio assets (e.g., `[{ id: 'bitcoin', amount: 0.5, purchasePrice: 50000 }]`).
  2. Create functions to `getPortfolio`, `addAsset`, `updateAsset`, `removeAsset` that interact with `localStorage`.
  3. Ensure data is properly serialized (JSON.stringify) and deserialized (JSON.parse).

**Task 2.2: Refactor Portfolio Components to Use Local Storage**
- **Success Criteria**: The existing portfolio components no longer rely on in-memory state but use the new local storage service. Adding an asset in the UI saves it, and it reappears on page load.
- **Sub-tasks**:
  1. Integrate the `usePortfolioStorage` hook into `PortfolioOverview.tsx` and `AddAssetModal.tsx`.
  2. Modify the logic to read from and write to `localStorage` via the service.
  3. Test the full CRUD (Create, Read, Update, Delete) lifecycle for portfolio assets.

**Task 2.3: Enhance Portfolio with Historical Data (Profit/Loss)**
- **Success Criteria**: The portfolio view can calculate and display total profit/loss based on a stored purchase price for each asset.
- **Sub-tasks**:
  1. Update the `AddAssetModal` to include a `purchasePrice` field.
  2. Update the data model to store this information.
  3. Implement the calculation logic in `PortfolioOverview.tsx` (`(currentPrice - purchasePrice) * amount`).

**Task 2.4: Technical Analysis Indicators**
- **Success Criteria**: The Bitcoin chart can display technical analysis indicators like MACD, RSI, and Moving Averages.
- **Sub-tasks**:
  1. Research and select a suitable charting library or plugin for technical indicators that works with Chart.js.
  2. Add UI controls (e.g., checkboxes or buttons) to toggle the visibility of each indicator on the chart.
  3. Implement the logic to calculate and render the selected indicators on the chart.

**Task 2.6: Indicator Info Tooltips (SMA/RSI/MACD + Signal)**
- **Success Criteria**: Add an info icon next to each indicator toggle that shows a concise explanation and warm-up requirements (e.g., MACD needs ≥26 bars for MACD, ≥35 for signal; RSI needs ≥14; SMA50 needs ≥50). Tooltip appears on click/hover.

**Task 2.7: Price Visibility Toggle (Indicators-only Mode)**
- **Success Criteria**: Add a control to hide/show the primary price dataset independently. Users can view indicators without the price line; tooltips omit hidden series.

**Task 2.8: Chart Coin Selector (BTC → selectable)**
- **Success Criteria**: Add a simple selector (dropdown or search) to choose the coin id (e.g., BTC, ETH). Chart updates data and indicators for the selected coin, preserving timeframe and indicator toggles.

==== Stop here waiting for user approval before next task. Without user approval, do not do git commit or push. ====

### Phase 3: AI-Powered Insights and Growth Strategy

- **AI-Powered Daily Briefing:** Use an LLM to generate a daily summary of market trends. This should be added in the `AI Insights` portal (Create A new portal) As several cells.
- **User Accounts & Personalization:** Develop a user account system.
- **Explore SaaS Model:** Investigate a potential SaaS subscription model.

==== Stop here waiting for user approval before next task. Without user approval, do not do git commit or push. ====

## Project Status Board

- [x] **Task 2.1: Implement Local Storage Service for Portfolio** - *COMPLETED*: `usePortfolio` persists to `localStorage`.
- [x] **Task 2.2: Refactor Portfolio Components to Use Local Storage** - *COMPLETED*: Components use the centralized storage logic.
- [x] **Task 2.3: Enhance Portfolio with Historical Data (Profit/Loss)** - *COMPLETED*: P&L derived from `purchasePrice`.
- [x] **Task 2.4: Technical Analysis Indicators** - *COMPLETED*: SMA, RSI, and MACD with toggles.
- [x] **Task 2.5: Ensure Charts Render Without API Data (Fallback + Empty-State)** - *COMPLETED*: Clear empty-state overlay when data missing.
- [x] **Task 2.6: Indicator Info Tooltips (SMA/RSI/MACD)**
- [x] **Task 2.7: Price Visibility Toggle (Indicators-only Mode)**
- [ ] **Task 2.8: Chart Coin Selector (BTC → selectable)**

### Phase 0: Critical Fixes (BLOCKING) - SAFEST APPROACH
- [x] Task 0.1: Remove Proxy Dependency & Add Environment Configuration
  - [x] Create `.env` file with API base URL
  - [x] Update `cryptoApi.ts` to use environment variable
  - [x] Remove proxy from `vite.config.ts`
  - [x] Add `.env.example` for documentation
- [ ] Task 0.2: Add Comprehensive Null Safety
  - [ ] Fix `GainersLosers.tsx` null safety
  - [ ] Fix `MarketOverview.tsx` null safety
  - [ ] Audit all components for unsafe `.toFixed()` calls
  - [ ] Add optional chaining and fallback values
- [ ] Task 0.3: Add Error Handling & Loading States
  - [ ] Verify loading states in all API components
  - [ ] Add error boundaries
  - [ ] Test offline/error scenarios
- [ ] Task 0.4: Testing & Validation
  - [ ] Test `pnpm dev` (port 5173)
  - [ ] Test `pnpm preview` (port 4173)
  - [ ] Verify identical behavior in both modes

### Phase 1
- [x] Trending Coins - Component implemented
- [x] Gainers & Losers - Component fully implemented and null-safe
- [ ] On-Chain Data Integration

### Phase 2
- [x] Technical Analysis Indicators
- [ ] Task 2.5: Ensure charts render without API data (fallback + empty-state UI)
- [ ] Customizable Watchlist

### Phase 3
- [ ] AI-Powered Daily Briefing
- [ ] User Accounts & Personalization
- [ ] Explore SaaS Model

## Current Status / Progress Tracking

**Last Updated**: October 18, 2025 - Phase 2 complete; charts handle empty data safely; indicators have tooltips and separate axes

**Current State**: 🟢 PHASE 2 COMPLETE

**Phase 2 Progress**:
- ✅ Task 2.1 COMPLETE: Portfolio data persists via localStorage
- ✅ Task 2.2 COMPLETE: Components correctly integrated with localStorage service
- ✅ Task 2.3 COMPLETE: Portfolio P&L calculations working
- ✅ Task 2.4 COMPLETE: Technical Analysis Indicators implemented
  - SMA (50-period) plotted on primary y-axis
  - RSI (14-period) plotted on secondary y-axis  
  - MACD with signal line plotted on secondary y-axis
  - Toggle buttons to enable/disable each indicator
  - Secondary y-axis only displays when RSI or MACD are active
- ✅ Task 2.6 COMPLETE: Info tooltips added for Price/SMA/RSI/MACD with warm-up requirements
- ✅ Task 2.7 COMPLETE: Price is toggleable like indicators (indicators-only view supported)

**Build/Lint**:
- `pnpm build`: succeeds
- Lint: no issues in `src/components/charts/BitcoinChart.tsx`

**Blockers**: NONE

**Next**:
- Implement Task 2.8 (Chart Coin Selector) after approval

## Executor's Feedback or Assistance Requests

**Status**: 🟢 PHASE 2 COMPLETE - Indicators and empty-state handling shipped

**Critical Issue Found and Fixed**:
The technical analysis indicators were not displaying because the `technicalindicators` library was **missing from `package.json`**. While the code was correct, the dependency was not properly registered:
- Root cause: Library was installed locally but not added to package.json during earlier work
- Solution applied: Added `"technicalindicators": "^3.1.0"` to dependencies
- Verification: `pnpm install` successfully installed the library
- Build test: `pnpm build` completes successfully with no errors
- Code verification: All imports and usage in `BitcoinChart.tsx` are correct

**Implementation Details** (verified in code):
- ✅ Chart.js is properly configured with multiple y-axes (primary and secondary)
- ✅ Indicators are calculated using `technicalindicators` library functions
- ✅ UI controls (buttons) correctly toggle each indicator on/off
- ✅ Dynamic y-axis scaling prevents visualization overlap
- ✅ Tooltips display all active indicator values

**How to Test**:
1. Run `pnpm dev` and navigate to the Charts section
2. Click on "SMA", "RSI", or "MACD" buttons to toggle indicators
3. Observe the additional lines appearing on the chart
4. Verify the secondary y-axis appears when RSI or MACD is active

**Phase 2 Completion Summary**:

## Lessons

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