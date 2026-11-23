# Stock Market Data Analyzer

A beginner-friendly Python project for exploring historical price data, calculating daily returns, moving averages and realized volatility, and running an educational SMA crossover simulation. The repository also includes a FastAPI service and a responsive dashboard preview.

> **Educational purposes only. This project is not financial advice, does not provide investment recommendations, and historical results do not predict future performance.** The dashboard uses illustrative sample data; the Python CLI can retrieve historical data through Yahoo Finance or load a CSV you supply.

## What it does

The analyzer accepts a ticker and date range, loads OHLCV history from Yahoo Finance or a CSV, cleans invalid rows, computes daily percentage returns, 20/50-day simple moving averages and 20-day annualized volatility, and writes a CSV plus a text summary. The API exposes a health endpoint, historical chart data, and an SMA20/50 long-only backtest with a configurable transaction fee. The dashboard illustrates a research workflow, watchlist, price and moving-average chart, risk summary, and a sample backtest interaction.

### Workflow

`Collect → validate / clean → engineer time-series features → analyze returns and risk → visualize → summarize → simulate`

## Architecture

```text
Yahoo Finance / CSV
        │
        ▼
  data loading + cleaning (main.py)
        │
        ├── returns, SMA20/50, volatility
        ├── outputs/<ticker>_analysis.csv
        └── outputs/<ticker>_report.txt
        ▲
        │
 FastAPI (api/app.py) ── /health, /chart/{ticker}, /backtest/sma
        │
 Next.js educational dashboard (app/, components/)
```

The data-source and analysis functions are separated from the UI/API so alternate vendors or persistence can be added later. This starter uses no database; reproducible output files are saved locally.

## Stack options

| Level | Tools | Expected output |
|---|---|---|
| Easy | Python, pandas, yfinance, Matplotlib | CLI summary and saved charts |
| Intermediate (this starter) | pandas, NumPy, yfinance, FastAPI, Next.js | Clean analysis files, API endpoints, interactive dashboard |
| Advanced | Add SQLite/DuckDB, scheduler, portfolio accounting, walk-forward tests, alerts and Docker | Persisted pipeline with repeatable research and monitoring |

## Project structure

```text
Stock-Market-Data-Analyzer/
├── api/                 # FastAPI endpoints
├── data/                # Optional input CSV files (do not commit large/private data)
├── docs/                # Project notes and architecture
├── images/              # Screenshots for the README
├── notebooks/           # Optional exploratory notebooks
├── outputs/             # Generated CSV and reports (ignored by git)
├── reports/             # Curated report exports
├── src/                 # Space for future modular analysis modules
├── app/                 # Next.js dashboard route and styles
├── components/          # Dashboard components
├── main.py              # Python CLI and analysis functions
├── requirements.txt     # Python dependencies
└── README.md
```

## Install

Python 3.11 or newer and Node.js 20+ are recommended.

**Windows PowerShell**
```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

**macOS / Linux**
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

## Run the Python analyzer

```bash
python main.py AAPL --start 2022-01-01
```

Or provide a CSV containing at least `Date` and `Close` columns:

```bash
python main.py DEMO --csv data/sample_prices.csv
```

The command writes `outputs/aapl_analysis.csv` and `outputs/aapl_report.txt`. Yahoo Finance is a public third-party source: availability, history, and terms can change; network access may be required. Always inspect the returned data and its dates.

## Run the API

```bash
uvicorn api.app:app --reload --port 8000
```

Endpoints: `GET /health`, `GET /chart/AAPL?days=252`, `POST /backtest/sma` with `{"ticker":"AAPL","fee_bps":5}`. Open `/docs` on the local API server for interactive endpoint documentation. The project dashboard preview is a frontend demonstration and is not wired to this Python service.

## Analysis concepts

- Daily return: close-to-close percentage change.
- SMA: rolling average of closing prices; it smooths short-term noise but is not a forecast.
- Annualized realized volatility: standard deviation of daily returns over 20 sessions multiplied by √252.
- SMA crossover simulation: uses yesterday's SMA state for today's close-to-close return to avoid using the current close to decide the same day's position. It is a simplified historical model and omits slippage, taxes, market impact, and many real-world constraints.

## GitHub proof-of-work plan

1. **Setup:** commit folder layout, requirements and README (`chore: scaffold market analyzer`).
2. **Ingestion:** commit Yahoo Finance and CSV paths (`feat: add historical price ingestion`).
3. **Analysis:** add cleaning, returns, SMAs and volatility (`feat: calculate price and risk metrics`).
4. **Visualization/API:** add dashboard and API (`feat: add market analysis dashboard and API`).
5. **Simulation:** document assumptions and test scenarios (`feat: add educational SMA backtest`).
6. **Portfolio presentation:** add screenshots and refine README (`docs: add project screenshots and usage guide`).

Capture the repository tree, CSV preview with dates, terminal summary, price/SMA chart, daily-return or volatility chart, backtest assumptions/results, and repository page. Use only data you are allowed to share; redact personal paths and credentials.

## Ideas to extend

SQLite/DuckDB storage, additional indicators with explicit warm-up periods, portfolio accounting, alert scheduling, alternate providers, Docker, and walk-forward evaluation. Evaluate backtests out of sample and disclose assumptions; do not treat any metric or signal as an instruction to trade.

## Interview preparation

1. **Explain your project.** I built an educational time-series analyzer that loads public or CSV historical prices, validates and cleans observations, computes returns, simple moving averages and realized volatility, and produces repeatable CSV/report outputs. I also added an API and dashboard prototype. It is research/learning software, not a trading recommendation.
2. **What problem does it solve?** It automates repetitive price-history summaries and makes the calculation pipeline easier to inspect and reproduce.
3. **What data did you use?** Daily OHLCV history from a public data source or a user-provided CSV; the analysis validates dates and numeric close values.
4. **What is a moving average?** A rolling mean over a fixed number of sessions that smooths price noise; it lags and does not predict price.
5. **How do you calculate a daily return?** Current close divided by prior close minus one, with the first observation undefined.
6. **What does volatility mean here?** Dispersion of historical daily returns over a rolling window, annualized by √252; it is not a complete measure of risk.
7. **How does the backtest avoid look-ahead bias?** The SMA-derived position is shifted by one session before applying returns. The demo still simplifies fills and omits real execution effects.
8. **How do you handle missing data?** Parse dates, coerce numeric closes, remove invalid rows, sort, and deduplicate dates; production code should log exclusions and validate OHLC relationships.
9. **What would you improve?** Add provider abstraction, automated tests, persistent storage, caching, corporate-action validation, and out-of-sample walk-forward evaluation.
10. **Explain it to a non-technical person.** It turns past prices into a few consistent charts and measurements so people can study what happened. It cannot say what a stock will do next.

**HR summary:** I built a Python and web-based market-data learning project that demonstrates ingestion, data quality, time-series feature engineering, visualization, API design, and careful communication of model limitations.
