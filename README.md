# Coin Compass - Crypto Technical Analysis Platform

## Project Overview
**Coin Compass** is a web-based crypto platform that allows users to search for cryptocurrencies, view live market data, and get auto-generated technical analysis & trading signals.  
Inspired by TradingView, with a dark fintech aesthetic and smooth animations.

![Coin Compass Mockup](./images/coin-compass-mockup.png)

**Goal:** Build a prototype demonstrating core functionality using **free CoinGecko API**.

---

## Tech Stack
- **Frontend:** React + TypeScript (or Next.js)
- **Charts:** Chart.js / ApexCharts / TradingView Lightweight Charts
- **State Management:** Redux / Zustand / Context API
- **Styling:** Tailwind CSS (dark neon aesthetic)
- **API:** CoinGecko (free, unlimited requests)
- **Optional AI:** OpenAI / local model for trading signal reasoning

![Tech Stack Diagram](./images/tech-stack.png)

---

## Core Features (MVP)

### 1. Coin Search
- Autocomplete search bar
- Show trending coins dynamically  

![Coin Search Mockup](./images/coin-search.png)

---

### 2. Live Price & Market Stats
- Price, 24h % change, market cap, supply  
- ATH / ATL  

![Market Stats Mockup](./images/market-stats.png)

---

### 3. Interactive Price Chart
- Candlestick view
- Multiple timeframes: 24H, 7D, 30D, 90D, 1Y
- Hover tooltips with price & volume

![Price Chart Mockup](./images/price-chart.png)

---

### 4. Auto Technical Analysis
- RSI, MACD, SMA/EMA, Bollinger Bands
- Buy/Sell/Hold signals with color-coded indicators  

![TA Signals Mockup](./images/ta-signals.png)

---

## Extended Features (Phase 2)
- Portfolio Watchlist with real-time P/L
- Candle pattern recognition (doji, hammer, engulfing)
- Price alerts via push notifications or email
- Coin details page with social stats & dev activity
- Multi-timeframe analysis comparison
- Dark/light mode toggle

![Extended Features Mockup](./images/extended-features.png)

---

## UI / Design
- Dark fintech aesthetic
  - Background: Deep navy / #0B0F2C
  - Bullish: Neon cyan / #00FFE0
  - Bearish: Coral red / #FF6B6B
- Smooth animations & glowing hover effects
- Minimalist layout to prioritize charts & stats

![UI Style Guide](./images/ui-style-guide.png)

---

## Project Structure
/coin-compass
├── /public
├── /src
│ ├── /components
│ │ ├── SearchBar.tsx
│ │ ├── CoinCard.tsx
│ │ ├── Chart.tsx
│ │ └── SignalBadge.tsx
│ ├── /pages
│ │ ├── Home.tsx
│ │ └── CoinDetails.tsx
│ ├── /services
│ │ └── coingeckoApi.ts
│ ├── /utils
│ │ └── technicalAnalysis.ts
│ └── App.tsx
├── package.json
└── README.md


---

## API Endpoints (CoinGecko)
- `/coins/markets` → for live price & market stats  
- `/coins/{id}/market_chart` → historical price data for charts  
- `/coins/list` → for autocomplete / search  

---

## MVP Roadmap
1. Set up React + Tailwind + Chart.js
2. Fetch live coin data from CoinGecko
3. Implement coin search & autocomplete
4. Render interactive price chart
5. Compute & display basic technical indicators (RSI, SMA, EMA)
6. Add color-coded Buy/Sell/Hold signals
7. Polish UI: dark theme, neon accents, hover effects

---

## Notes
- Focus on **fast loading** and **clear UX**
- TA can start as formulas; upgrade to AI signals later
- Keep API requests minimal

---

## Future Ideas
- AI-powered reasoning for signals
- Mobile-friendly responsive layout
- Shareable coin analysis links
- Integration with portfolio trackers & alerts
