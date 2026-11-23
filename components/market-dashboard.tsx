"use client"

import { useMemo, useState } from "react"
import { Activity, ArrowDownRight, ArrowUpRight, Bell, ChevronDown, CircleHelp, Clock3, Download, ExternalLink, LayoutDashboard, Menu, MoreHorizontal, Plus, Search, Settings2, SlidersHorizontal, Sparkles, Star, TrendingUp, Wallet, X } from "lucide-react"

type Candle = { day: string; close: number; sma20: number; sma50: number; volume: number }

const assets = [
  { ticker: "NVDA", name: "NVIDIA Corporation", sector: "Semiconductors", price: 142.87, change: 2.34, color: "#8b5cf6", initials: "N" },
  { ticker: "AAPL", name: "Apple Inc.", sector: "Consumer electronics", price: 237.49, change: 1.18, color: "#d1d5db", initials: "A" },
  { ticker: "MSFT", name: "Microsoft Corporation", sector: "Software", price: 428.76, change: -0.42, color: "#60a5fa", initials: "M" },
  { ticker: "TSLA", name: "Tesla, Inc.", sector: "Automotive", price: 352.56, change: 3.62, color: "#f87171", initials: "T" },
  { ticker: "AMZN", name: "Amazon.com, Inc.", sector: "E-commerce", price: 212.35, change: -1.06, color: "#fbbf24", initials: "a" },
]

function makeSeries(ticker: string, price: number, range: string): Candle[] {
  const count = range === "1M" ? 28 : range === "3M" ? 62 : range === "6M" ? 90 : 120
  let value = price * 0.76
  const seed = ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return Array.from({ length: count }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.22) * price * 0.009 + Math.cos((i + seed) * 0.08) * price * 0.005
    value = Math.max(price * 0.63, value + wave + price * 0.0018)
    const progress = (i + 1) / count
    return { day: `${String((i % 28) + 1).padStart(2, "0")}`, close: value + (price - value) * progress * 0.48, sma20: value * 0.98 + price * 0.02 * progress, sma50: value * 0.94 + price * 0.06 * progress, volume: 25 + Math.abs(Math.sin((i + seed) * 0.57)) * 70 }
  })
}

function PriceChart({ rows }: { rows: Candle[] }) {
  const width = 760, height = 300, left = 54, right = 18, top = 16, bottom = 28
  const prices = rows.flatMap((row) => [row.close, row.sma20, row.sma50])
  const min = Math.min(...prices) * 0.985, max = Math.max(...prices) * 1.015
  const x = (i: number) => left + i * (width - left - right) / (rows.length - 1)
  const y = (v: number) => top + (max - v) * (height - top - bottom) / (max - min)
  const path = (key: "close" | "sma20" | "sma50") => rows.map((row, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(row[key]).toFixed(1)}`).join(" ")
  const area = `${path("close")} L${x(rows.length - 1)},${height - bottom} L${x(0)},${height - bottom} Z`
  return <svg viewBox={`0 0 ${width} ${height}`} className="price-svg" role="img" aria-label="Historical closing price with 20 and 50 day moving averages">
    <defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#35c89a" stopOpacity=".2"/><stop offset="100%" stopColor="#35c89a" stopOpacity="0"/></linearGradient></defs>
    {[0, 1, 2, 3, 4].map((tick) => { const value = max - (max - min) * tick / 4; const yy = y(value); return <g key={tick}><line x1={left} x2={width - right} y1={yy} y2={yy} stroke="#262d37" strokeDasharray="3 5"/><text x={left - 9} y={yy + 4} textAnchor="end" fill="#77808e" fontSize="10">${value.toFixed(0)}</text></g> })}
    <path d={area} fill="url(#fill)"/><path d={path("sma50")} fill="none" stroke="#e4aa57" strokeWidth="1.7" strokeDasharray="5 4"/><path d={path("sma20")} fill="none" stroke="#8589f4" strokeWidth="1.7"/><path d={path("close")} fill="none" stroke="#3dd0a0" strokeWidth="2.2"/>
    {rows.filter((_, i) => i % Math.ceil(rows.length / 6) === 0).map((row, i) => <text key={`${row.day}-${i}`} x={x(i * Math.ceil(rows.length / 6))} y={height - 6} textAnchor="middle" fill="#77808e" fontSize="10">{row.day} Oct</text>)}
  </svg>
}

function MiniLine({ positive, seed }: { positive: boolean; seed: number }) {
  const points = Array.from({ length: 16 }, (_, i) => `${i * 4},${18 - Math.sin((i + seed) * 0.7) * 5 - i * (positive ? 0.35 : -0.15)}`).join(" ")
  return <svg width="68" height="28" viewBox="0 0 60 28" aria-hidden="true"><polyline points={points} fill="none" stroke={positive ? "#39c99a" : "#f17676"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

export function MarketDashboard() {
  const [selected, setSelected] = useState(assets[0])
  const [range, setRange] = useState("3M")
  const [query, setQuery] = useState("")
  const [running, setRunning] = useState(false)
  const [backtested, setBacktested] = useState(false)
  const [watchlist, setWatchlist] = useState(assets)
  const rows = useMemo(() => makeSeries(selected.ticker, selected.price, range), [selected, range])
  const filtered = watchlist.filter((asset) => `${asset.ticker} ${asset.name}`.toLowerCase().includes(query.toLowerCase()))
  const first = rows[0]?.close ?? selected.price
  const change = ((selected.price - first) / first * 100)
  const runBacktest = () => { setRunning(true); window.setTimeout(() => { setRunning(false); setBacktested(true) }, 650) }
  return <main className="market-app">
    <aside className="sidebar"><a className="brand" href="#overview"><span className="brand-icon"><Activity size={17}/></span><span>signal<span className="brand-dot">.</span><small>MARKET INTELLIGENCE</small></span></a>
      <div className="nav-label">WORKSPACE</div><a className="nav-item active" href="#overview"><LayoutDashboard size={17}/> Overview</a><a className="nav-item" href="#watchlist"><Star size={17}/> Watchlist <span className="nav-count">05</span></a><a className="nav-item" href="#portfolio"><Wallet size={17}/> Portfolio</a><a className="nav-item" href="#research"><TrendingUp size={17}/> Research lab <span className="new-badge">NEW</span></a>
      <div className="sidebar-bottom"><div className="plan-card"><span className="plan-icon"><Sparkles size={15}/></span><strong>Student workspace</strong><p>Explore historical market data and test ideas.</p><button onClick={() => setBacktested(true)}>View project guide <ExternalLink size={12}/></button></div><a className="nav-item" href="#help"><CircleHelp size={17}/> Help center</a><a className="nav-item" href="#settings"><Settings2 size={17}/> Settings</a><div className="profile"><div className="avatar">JD</div><span><strong>Jordan Davis</strong><small>Personal workspace</small></span><MoreHorizontal size={18}/></div></div>
    </aside>
    <section className="main-area"><header className="topbar"><button className="mobile-menu" aria-label="Open navigation"><Menu size={19}/></button><div className="crumb">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-actions"><span className="market-status"><i/> Market data demo</span><button className="icon-button" aria-label="Notifications"><Bell size={17}/><b/></button><div className="avatar avatar-small">JD</div></div></header>
      <div className="content"><div className="page-heading"><div><div className="eyebrow">HISTORICAL DATA · EDUCATIONAL DEMO <span className="eyebrow-line"/></div><h1>Market overview</h1><p className="subheading">Your market, at a glance. Research with clarity.</p></div><button className="export-button" onClick={() => window.print()}><Download size={15}/> Export report</button></div>
        <section className="market-strip" aria-label="Market indices"><div className="strip-intro"><span className="live-dot"/> MARKET PULSE</div>{[{name:"S&P 500",value:"6,735.12",change:"+0.42%",up:true},{name:"NASDAQ",value:"22,941.80",change:"+0.81%",up:true},{name:"DOW JONES",value:"46,706.58",change:"−0.18%",up:false},{name:"VIX",value:"18.24",change:"−2.36%",up:true}].map((item)=><div className="index-item" key={item.name}><span>{item.name}</span><strong>{item.value}</strong><small className={item.up?"gain":"loss"}>{item.change} <span>today</span></small></div>)}</section>
        <div className="overview-grid"><section className="panel chart-panel"><div className="panel-header"><div><div className="selected-stock"><span className="asset-mark" style={{background:selected.color}}>{selected.initials}</span><div><strong>{selected.ticker}</strong><span>{selected.name}</span></div></div><ChevronDown size={15}/></div><button className="icon-button subdued" aria-label="Add to favorites"><Star size={16}/></button></div>
          <div className="price-row"><strong>${selected.price.toFixed(2)}</strong><span className="gain"><ArrowUpRight size={15}/> {Math.abs(change).toFixed(2)}% <small>in period</small></span></div><div className="chart-toolbar"><div className="chart-tabs"><button className="selected-tab">Price</button><button>Returns</button><button>Volume</button></div><div className="range-buttons">{["1M","3M","6M","1Y"].map((item)=><button key={item} className={range===item?"range-active":""} onClick={()=>setRange(item)}>{item}</button>)}</div></div>
          <PriceChart rows={rows}/><div className="chart-legend"><span><i className="legend-price"/> Close</span><span><i className="legend-sma"/> SMA 20</span><span><i className="legend-sma50"/> SMA 50</span><span className="chart-footnote">Daily · USD</span></div></section>
          <section className="panel watchlist-panel" id="watchlist"><div className="panel-heading"><div><h2>Watchlist</h2><p>Tracking {watchlist.length} assets</p></div><button className="icon-button subdued" aria-label="Add asset" onClick={()=>setQuery(query?"":"A")}><Plus size={17}/></button></div><label className="search-box"><Search size={15}/><input aria-label="Search watchlist" placeholder="Search assets..." value={query} onChange={e=>setQuery(e.target.value)}/><kbd>⌘ K</kbd></label><div className="watchlist-head"><span>ASSET</span><span>PRICE</span><span>CHANGE</span></div><div className="watchlist-rows">{filtered.map(asset=><button className={`watch-row ${selected.ticker===asset.ticker?"watch-selected":""}`} key={asset.ticker} onClick={()=>setSelected(asset)}><span className="watch-asset"><span className="asset-mark mini" style={{background:asset.color}}>{asset.initials}</span><span><strong>{asset.ticker}</strong><small>{asset.sector}</small></span></span><strong className="watch-price">${asset.price.toFixed(2)}</strong><span className={asset.change>=0?"gain":"loss"}>{asset.change>=0?"+":""}{asset.change.toFixed(2)}%</span><MiniLine positive={asset.change>=0} seed={asset.ticker.charCodeAt(0)}/></button>)}</div><button className="watchlist-link" onClick={()=>setWatchlist(watchlist.length===assets.length?assets.slice(0,4):assets)}>{watchlist.length===assets.length?"View all assets":"Show all assets"}<ArrowUpRight size={14}/></button></section></div>
        <div className="lower-grid"><section className="panel metrics-panel"><div className="panel-heading"><div><h2>Risk & performance</h2><p>Key stats for {selected.ticker} · 3 months</p></div><button className="icon-button subdued" aria-label="Metric settings"><SlidersHorizontal size={16}/></button></div><div className="metric-grid"><div className="metric"><span>Total return <CircleHelp size={12}/></span><strong className={change>=0?"gain":"loss"}>{change>=0?"+":""}{change.toFixed(2)}%</strong><small>Price change over selected period</small></div><div className="metric"><span>Annualized volatility <CircleHelp size={12}/></span><strong>24.8%</strong><small className="neutral-note">Moderate · 252 trading days</small></div><div className="metric"><span>52-week range <CircleHelp size={12}/></span><strong>$86.62 <em>—</em> $153.13</strong><div className="range-track"><i/></div><small>Current: $142.87</small></div><div className="metric"><span>Avg. daily volume <CircleHelp size={12}/></span><strong>42.6M</strong><small>Shares traded per session</small></div></div></section>
          <section className="panel backtest-panel"><div className="panel-heading"><div><h2>Strategy lab</h2><p>Test a simple moving average crossover</p></div><span className="lab-icon"><Activity size={16}/></span></div><div className="strategy-line"><div className="strategy-icon"><TrendingUp size={18}/></div><div><strong>SMA crossover</strong><small>20-day vs. 50-day · Long only</small></div><span className="strategy-tag">DEMO</span></div>{backtested?<div className="backtest-result"><span>Historical simulation result</span><strong>+12.6% <small>total return</small></strong><div><span>Max drawdown <b>−8.2%</b></span><span>Sharpe ratio <b>1.14</b></span></div></div>:<p className="backtest-explain">See how a rules-based strategy would have performed on past prices. Historical results do not predict future returns.</p>}<button className="run-button" onClick={runBacktest} disabled={running}>{running?<><span className="spinner"/> Running simulation...</>:<><Activity size={15}/> {backtested?"Run again":"Run backtest"}<ArrowUpRight size={14}/></>}</button><div className="simulation-note"><Clock3 size={12}/> Simulation uses illustrative sample data</div></section></div>
        <div className="disclaimer"><span>EDUCATIONAL DEMO</span><p>Market data and performance figures on this dashboard are illustrative sample data, not live quotes. This tool is for educational purposes only and is not financial advice.</p><button aria-label="Dismiss disclaimer"><X size={15}/></button></div>
        <footer className="footer"><span>Signal Market Intelligence <b>·</b> Educational project</span><span>Data shown for demonstration <b>·</b> Not financial advice</span></footer>
      </div>
    </section>
  </main>
}
