# WealthPro

A responsive fintech app built with React, Vite, Tailwind CSS, and i18next.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with mock data |
| `npm run dev:qa` | Dev server pointing at QA API |
| `npm run dev:uat` | Dev server pointing at UAT API |
| `npm run build` | Production build |
| `npm run build:qa` | Build for QA environment |
| `npm run build:uat` | Build for UAT environment |
| `npm run preview` | Preview production build locally |

## Environment Configuration

Copy the example file and adjust values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL for the backend API |
| `VITE_ENV` | Environment name (`dev`, `qa`, `uat`, `production`) |

Environment files (all gitignored):

```
.env            # local overrides
.env.dev        # dev defaults
.env.qa         # QA API
.env.uat        # UAT API
.env.production # production API
```

## Mock Configuration

Mock is configured per-endpoint in `src/api/mock/handlers.js` — no env vars needed.

```js
export const mockedEndpoints = new Set([
  'POST /auth/login',
  'GET /products',
  // 'GET /products/:id',  ← commented out = hits real API
  ...
])
```

- Entry present → mocked (returns data from `src/api/mock/endpoints/<key>/response.json`)
- Entry commented out or deleted → real API

To add or edit mock response data, open the corresponding `response.json`:

```
src/api/mock/endpoints/
  auth_login/response.json
  auth_profile/response.json
  products/response.json
  products_detail/response.json
  portfolio_holdings/response.json
  portfolio_summary/response.json
  portfolio_transactions/response.json
  portfolio_accounts/response.json
  trade_buy/response.json
  trade_sell/response.json
```

## Project Structure

```
src/
  api/
    http.js           # axios instance + mock interceptor
    mock/
      handlers.js     # mockedEndpoints config + route table
      endpoints/      # per-endpoint mock response JSON files
    services/
      auth.js         # /auth/login, /auth/profile
      product.js      # /products, /products/:id
      portfolio.js    # /portfolio/holdings|summary|transactions
      trade.js        # /trade/buy|sell
    index.js          # re-exports all services
  components/         # shared UI components
  i18n/               # translations (en, zh-CN, zh-TW)
  pages/              # route-level page components
  store/              # Zustand state (auth, portfolio)
  config.js           # reads env variables
  main.jsx            # app entry point
```

## Features

- Market — browse and search products (funds, stocks, wealth management)
- Assets — holdings overview with summary cards, click through to holding detail
- Holding Detail — NAV trend chart with buy/sell markers, transaction history with status timeline
- Transactions — filterable list with keyword, type, and date range filters
- Settings — language picker (English, 简体中文, 繁體中文)
- Responsive — desktop sidebar + header, mobile fixed top bar + FAB menu

## Tech Stack

- React 18, React Router 6
- Vite 5
- Tailwind CSS 3
- Recharts
- Zustand
- i18next / react-i18next
- Axios
