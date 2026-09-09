# 📈 Dynamic Portfolio Dashboard

> **Production-Grade Real-Time Stock Portfolio & Financial Analytics Web Application**  
> **Author:** Nishant Makwana  
> **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Docker, MongoDB (Mongoose), Yahoo Finance & Google Finance API Proxy

---

## 🌟 Overview & Architecture

This application is a minimal, high-density, real-time stock portfolio tracking and financial analytics dashboard. It processes baseline holdings from portfolio data sheets and enriches them dynamically with live market quotes (CMP, P/E Ratios, Latest Earnings/EPS, 52-week High/Low).

### ✨ Highlights & Design System:
- **Clean Single-Page Flow:** Unified slate dark background (`bg-slate-950`) without jarring header or footer card dividers.
- **Dockerized MongoDB:** Docker container running MongoDB 7.0 (`dynamic-portfolio-mongodb`) with authentication credentials `nishant:nishant` and DB `dynamic-portfolio`. Includes automatic fail-safe in-memory store fallback.
- **Real-Time Data Pipeline:** Server-side proxy fetching live market prices for Indian stock tickers (NSE/BSE) with 15-second server caching to prevent rate-limits.
- **Responsive Layout & Text Safety:** Optimized component containers preventing numerical font overflow across all viewports (Mobile, Tablet, Desktop).
- **Sector Accordions & Grouping:** Group holdings by sector (*Financials, Tech, Consumer, Power, Pipe, Others*) with sector weights and aggregate metrics.
- **Interactive Visualizations:** High-density Recharts allocation donut and performance comparison bar charts.
- **Full Portfolio Management:** Interactive modal to add, edit, or remove holdings with live metric updates.
- **Data Export & Seed:** One-click CSV and JSON export, plus seed dataset restoration.
- **Multi-Currency:** Dynamic toggle between **₹ INR** and **$ USD**.
- **SEO & Metadata:** Modern OpenGraph, Twitter card tags, search keywords, and responsive viewport configuration.

---

## 🛠️ Project Structure

```
dynamic-portfolio-dashboard/
├── docker-compose.yml                # Dockerized MongoDB configuration (nishant:nishant)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── portfolio/            # GET & POST portfolio holdings
│   │   │   ├── portfolio/[id]/       # PUT & DELETE single holding
│   │   │   ├── portfolio/seed/       # Seed database with initial dataset
│   │   │   └── stocks/live/          # Real-time Yahoo & Google Finance proxy
│   │   ├── layout.tsx                # Global layout with SEO metadata & viewport settings
│   │   ├── page.tsx                  # Main Portfolio Dashboard page
│   │   └── globals.css               # Tailwind CSS styles
│   ├── components/
│   │   ├── DashboardHeader.tsx       # Minimal header navigation
│   │   ├── SummaryCards.tsx          # Key metrics (Valuation, Investment, Total Return)
│   │   ├── PortfolioTable.tsx        # Responsive sector-grouped data table
│   │   ├── PortfolioCharts.tsx       # Recharts allocation & performance visuals
│   │   ├── HoldingModal.tsx          # Add / Edit stock modal dialog
│   │   ├── ExportImportModal.tsx     # CSV/JSON data export & reset modal
│   │   └── ErrorDisclaimerBanner.tsx # Live API status notification banner
│   └── lib/
│       ├── types.ts                  # TypeScript interfaces & types
│       ├── initialData.ts            # Seed dataset definition
│       ├── db.ts                     # Mongoose connection & in-memory fallback
│       ├── financeService.ts         # Yahoo/Google scraper & 15s TTL caching service
│       └── exportUtils.ts            # CSV & JSON file generators
├── .env.example                      # Environment variables template
├── .env                              # Active environment configuration
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Docker & Docker Compose** (Optional, for running local containerized MongoDB)

### 2. Clone & Install
```bash
git clone <repository-url>
cd dynamic-portfolio-dashboard
npm install
```

### 3. Start Containerized MongoDB (Docker)
Start the Dockerized MongoDB instance with pre-configured authentication (`nishant:nishant`):
```bash
docker compose up -d
```
Verify the container status:
```bash
docker ps
```
*(Container `dynamic-portfolio-mongodb` will run on port `27017`)*

### 4. Configure Environment Variables
`.env` comes pre-configured:
```env
MONGODB_URI=mongodb://nishant:nishant@127.0.0.1:27017/dynamic-portfolio?authSource=admin
FINANCE_CACHE_TTL=15000
```
*(If MongoDB is stopped, the application will fallback to in-memory mode seamlessly.)*

### 5. Run Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build
```bash
npm run build
npm run start
```

---

## 📄 License & Credits

Designed and Developed with ❤️ by **Nishant Makwana**.
