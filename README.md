# Ticker — Market Intelligence Dashboard

Ticker is a stock-market analysis dashboard built with Next.js and React. It combines an educational market overview, a price chart with moving averages, watchlist views, risk metrics, and a simple SMA crossover strategy lab.

The project also includes a Python CLI and FastAPI backend for loading market data, calculating indicators, and running an educational backtest.

**Live app:** [https://ticker-webss.vercel.app](https://ticker-webss.vercel.app)

> Educational purposes only. Market values shown in the dashboard may be illustrative and must not be treated as live data or financial advice.

## Features

- Interactive historical price chart
- 20-day and 50-day simple moving averages
- Stock watchlist with search and selection
- Risk and performance metrics
- SMA 20/50 crossover strategy lab
- Python data ingestion and CSV export
- FastAPI endpoints for chart data and backtesting
- Responsive market dashboard interface

## Technology

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Python 3
- pandas and NumPy
- yfinance
- FastAPI and Uvicorn
- Vercel

## Getting Started

### Prerequisites

- Node.js 20 or newer
- pnpm
- Python 3.11 or newer

### Frontend

```bash
git clone https://github.com/Sakshi-2006/ticker.git
cd ticker
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

Create a production build with:

```bash
pnpm build
pnpm start
```

### Python Backend

Create and activate a virtual environment:

```bash
python -m venv .venv
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

## Python CLI

Analyze a ticker using Yahoo Finance:

```bash
python main.py AAPL --start 2022-01-01
```

Analyze a local CSV containing `Date` and `Close` columns:

```bash
python main.py DEMO --csv data/sample_prices.csv
```

The CLI writes a cleaned analysis CSV and text summary to the `outputs` directory.

## FastAPI Server

Start the API:

```bash
uvicorn api.app:app --reload --port 8000
```

Open the interactive API documentation at `http://localhost:8000/docs`.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Returns API health status |
| GET | `/chart/{ticker}?days=252` | Returns chart and indicator data |
| POST | `/backtest/sma` | Runs an SMA 20/50 educational backtest |

Example backtest request:

```json
{
  "ticker": "AAPL",
  "fee_bps": 5
}
```

## Project Structure

```text
app/                 Next.js application routes
components/          Dashboard and UI components
api/                 FastAPI routes
lib/                 Shared utilities
public/              Static assets
main.py              Python analysis CLI
requirements.txt     Python dependencies
package.json         Frontend dependencies and scripts
```

## Analysis Methods

- **Daily return:** Percentage change from one closing price to the next.
- **SMA 20:** Rolling 20-session simple moving average.
- **SMA 50:** Rolling 50-session simple moving average.
- **Realized volatility:** Annualized standard deviation of recent daily returns.
- **SMA backtest:** Long-only crossover simulation that shifts positions by one session to reduce same-day look-ahead bias.

## Deployment

The frontend is deployed on Vercel:

**Live app:** [https://ticker-webss.vercel.app](https://ticker-webss.vercel.app)

## License

No license has been specified for this repository. Review the repository policies before reuse or redistribution.
