"""Educational stock market analyzer. Sample usage: python main.py AAPL"""
from __future__ import annotations
import argparse
from datetime import date, timedelta
from pathlib import Path
import pandas as pd
import yfinance as yf


def load_prices(ticker: str, start: str, csv_path: str | None = None) -> pd.DataFrame:
    if csv_path:
        frame = pd.read_csv(csv_path, parse_dates=["Date"])
    else:
        frame = yf.download(ticker, start=start, auto_adjust=True, progress=False)
        if frame.empty:
            raise ValueError(f"No price history returned for {ticker}. Check the symbol or use --csv.")
        if isinstance(frame.columns, pd.MultiIndex):
            frame.columns = frame.columns.get_level_values(0)
        frame = frame.rename_axis("Date").reset_index()
    frame.columns = [str(col).lower().replace(" ", "_") for col in frame.columns]
    date_col = "date" if "date" in frame else "datetime"
    close_col = "close" if "close" in frame else "adj_close"
    frame[date_col] = pd.to_datetime(frame[date_col], errors="coerce")
    frame[close_col] = pd.to_numeric(frame[close_col], errors="coerce")
    frame = frame.dropna(subset=[date_col, close_col]).sort_values(date_col).drop_duplicates(date_col)
    return frame.rename(columns={date_col: "date", close_col: "close"}).reset_index(drop=True)


def analyze(frame: pd.DataFrame) -> pd.DataFrame:
    result = frame.copy()
    result["daily_return"] = result["close"].pct_change()
    result["sma20"] = result["close"].rolling(20, min_periods=20).mean()
    result["sma50"] = result["close"].rolling(50, min_periods=50).mean()
    result["volatility_20d"] = result["daily_return"].rolling(20).std() * (252 ** 0.5)
    return result


def write_outputs(frame: pd.DataFrame, ticker: str, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    frame.to_csv(output_dir / f"{ticker.lower()}_analysis.csv", index=False)
    returns = frame["daily_return"].dropna()
    latest = frame.iloc[-1]
    first_close = frame.iloc[0]["close"]
    summary = [
        f"Educational analysis: {ticker.upper()}",
        f"Period: {frame.iloc[0]['date'].date()} to {latest['date'].date()}",
        f"Observations: {len(frame)}",
        f"Closing price: ${latest['close']:.2f}",
        f"Period return: {(latest['close'] / first_close - 1) * 100:.2f}%",
        f"Annualized volatility (20-day): {latest['volatility_20d'] * 100:.2f}%" if pd.notna(latest["volatility_20d"]) else "Annualized volatility (20-day): insufficient history",
        f"Maximum close: ${frame['close'].max():.2f}",
        f"Minimum close: ${frame['close'].min():.2f}",
        f"Mean daily return: {returns.mean() * 100:.3f}%" if not returns.empty else "Mean daily return: n/a",
        "\nEducational purposes only. Not financial advice.",
    ]
    (output_dir / f"{ticker.lower()}_report.txt").write_text("\n".join(summary), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ticker", nargs="?", default="AAPL")
    parser.add_argument("--start", default=(date.today() - timedelta(days=365 * 2)).isoformat())
    parser.add_argument("--csv", help="Optional CSV with Date and Close columns")
    parser.add_argument("--output", default="outputs")
    args = parser.parse_args()
    ticker = args.ticker.strip().upper()
    result = analyze(load_prices(ticker, args.start, args.csv))
    write_outputs(result, ticker, Path(args.output))
    print(f"Analysis complete for {ticker}: {len(result)} rows")
    print(f"Latest close: ${result.iloc[-1]['close']:.2f}")
    print(f"Outputs saved to {args.output}/")
    print("Educational purposes only — not financial advice.")


if __name__ == "__main__":
    main()
