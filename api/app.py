"""Small educational API for market data inspection and SMA backtests."""
from datetime import date, timedelta
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from main import analyze, load_prices

app = FastAPI(title="Stock Market Data Analyzer", version="1.0.0", description="Educational market data exploration API; not financial advice.")


def get_analysis(ticker: str, start: str | None = None):
    symbol = ticker.strip().upper()
    if not symbol.isalnum() or not 1 <= len(symbol) <= 10:
        raise HTTPException(status_code=422, detail="Ticker must contain 1–10 letters or numbers.")
    try:
        return symbol, analyze(load_prices(symbol, start or (date.today() - timedelta(days=365 * 2)).isoformat()))
    except (ValueError, Exception) as error:
        raise HTTPException(status_code=502, detail=f"Could not retrieve market data for {symbol}.") from error


@app.get("/health")
def health():
    return {"status": "ok", "disclaimer": "Educational purposes only; not financial advice."}


@app.get("/chart/{ticker}")
def chart(ticker: str, days: int = Query(252, ge=20, le=2000)):
    symbol, frame = get_analysis(ticker)
    columns = [name for name in ("date", "close", "sma20", "sma50", "daily_return", "volatility_20d") if name in frame]
    rows = frame.tail(days)[columns].copy()
    rows["date"] = rows["date"].dt.strftime("%Y-%m-%d")
    return {"ticker": symbol, "rows": rows.astype(object).where(rows.notna(), None).to_dict(orient="records")}


class BacktestRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=10, pattern=r"^[A-Za-z0-9.\-^=]+$")
    fee_bps: float = Field(default=5, ge=0, le=500)
    start: str | None = None
    end: str | None = None


@app.post("/backtest/sma")
def backtest(request: BacktestRequest):
    symbol, frame = get_analysis(request.ticker, request.start)
    if request.end:
        frame = frame[frame["date"] <= request.end]
    frame = frame.dropna(subset=["sma20", "sma50"]).copy()
    if len(frame) < 2:
        raise HTTPException(status_code=422, detail="Not enough clean history for this backtest.")
    signal = (frame["sma20"] > frame["sma50"]).astype(int)
    position = signal.shift(1).fillna(0)
    returns = frame["close"].pct_change().fillna(0)
    turns = position.diff().abs().fillna(0)
    net = position * returns - turns * (request.fee_bps / 10_000)
    equity = (1 + net).cumprod()
    volatility = net.std(ddof=1)
    sharpe = float((net.mean() / volatility) * (252 ** .5)) if volatility else 0.0
    drawdown = equity / equity.cummax() - 1
    trade_returns = net[turns > 0]
    return {"ticker": symbol, "strategy": "SMA20/50 long-only crossover", "pnl": float(equity.iloc[-1] - 1), "max_drawdown": float(drawdown.min()), "sharpe": sharpe, "trades": int((turns > 0).sum()), "win_rate": float((trade_returns > 0).mean()) if not trade_returns.empty else 0.0, "disclaimer": "Historical simulation only; excludes slippage and does not predict future results."}
