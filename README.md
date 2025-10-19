# Crypto Analysis Dashboard

A comprehensive cryptocurrency analysis and portfolio management dashboard built with React, TypeScript, and Vite. Track real-time crypto prices, market trends, and manage your portfolio with a beautiful, modern UI.

> This project is a fork of the Minimax hackathon [project](https://agent.minimax.io/share/300474460274837) provided by @Zillizezz

## Features

### Market Overview
- **Real-time Price Tracking**: Live cryptocurrency prices from CoinGecko API
- **Market Statistics**: Global market cap, 24h volume, and dominance metrics
- **Trending Coins**: Discover the hottest cryptocurrencies
- **Gainers & Losers**: Track top performing and declining assets

### Portfolio Management
- **Asset Tracking**: Add and manage your crypto holdings
- **Portfolio Analytics**: View total value, profit/loss, and allocation
- **Performance Metrics**: Track your investment performance over time

### Advanced Charting
- **Interactive Price Charts**: Visualize price movements with Chart.js
- **Multiple Timeframes**: 24h, 7d, 30d, 90d, 1y, and max views
- **Technical Indicators**: (Planned) MACD, RSI, Moving Averages

### Modern UI/UX
- **Glassmorphism Design**: Beautiful glass-effect cards and components
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Dark Theme**: Eye-friendly interface for extended use
- **Smooth Animations**: Powered by Framer Motion

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ktwu01/crypto-dashboard.git
   cd crypto-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   The default configuration uses CoinGecko's free API:
   ```env
   VITE_API_BASE_URL=https://api.coingecko.com/api/v3
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:5173](http://localhost:5173)

## Available Scripts

- `pnpm dev` - Start development server (with HMR)
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint to check code quality

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Radix UI + Custom Components
- **Charts**: Chart.js + React-Chartjs-2
- **Animations**: Framer Motion
- **API Client**: Axios
- **State Management**: React Query
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod

## Configuration

### API Configuration
The app uses CoinGecko's public API by default. No API key is required for basic usage.

To use a different API or endpoint:
1. Update `.env` file:
   ```env
   VITE_API_BASE_URL=your_api_url_here
   ```

2. Restart the development server

### Environment Variables
- `VITE_API_BASE_URL` - Base URL for cryptocurrency API (default: CoinGecko)

## Features Roadmap

- [x] Real-time market data
- [x] Portfolio management
- [x] Interactive price charts
- [x] Trending coins & market movers
- [ ] Technical analysis indicators
- [ ] Customizable watchlists
- [ ] AI-powered market insights
- [ ] User accounts & cloud sync
- [ ] Mobile app (React Native)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [CoinGecko API](https://www.coingecko.com/en/api) for cryptocurrency data
- [@Zillizezz](https://github.com/Zillizezz) for the original Minimax hackathon project
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Instructions for deploying to various platforms
- [Project Plan](./.cursor/scratchpad.md) - Development roadmap and progress tracking

## Support

For questions or issues, please [open an issue](https://github.com/ktwu01/crypto-dashboard/issues) on GitHub.

---

Built with React + TypeScript + Vite
