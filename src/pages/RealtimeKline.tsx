import { useEffect, useMemo, useRef, useState } from 'react'
import { createChart, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import { getBinanceKlines } from '../lib/api'
import { useBinanceKline } from '../lib/ws'

export default function RealtimeKline() {
  const symbol = 'BTCUSDT'
  const interval = '1m'
  const containerRef = useRef<HTMLDivElement>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const [ready, setReady] = useState(false)

  // 初始化历史K线
  useEffect(() => {
    let dispose = () => {}
    ;(async () => {
      if (!containerRef.current) return
      const chart = createChart(containerRef.current, {
        autoSize: true,
        layout: { textColor: '#ccc', background: { type: 'Solid', color: 'transparent' } },
        grid: { vertLines: { visible: false }, horzLines: { visible: false } },
        timeScale: { secondsVisible: false, borderVisible: false },
        rightPriceScale: { borderVisible: false },
      })
      const candle = chart.addCandlestickSeries()
      seriesRef.current = candle

      const raw = await getBinanceKlines(symbol, interval, 500)
      const data = raw.map((k) => ({
        time: Math.floor(k[0] / 1000) as UTCTimestamp,
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
      }))
      candle.setData(data)
      setReady(true)

      const onResize = () => chart.applyOptions({ autoSize: true })
      window.addEventListener('resize', onResize)
      dispose = () => {
        window.removeEventListener('resize', onResize)
        chart.remove()
      }
    })()
    return () => dispose()
  }, [symbol, interval])

  // 实时推送更新
  const tick = useBinanceKline(symbol.toLowerCase(), interval)
  useEffect(() => {
    if (!ready || !seriesRef.current || !tick) return
    seriesRef.current.update({
      time: Math.floor(tick.k.start / 1000) as UTCTimestamp,
      open: tick.k.open,
      high: tick.k.high,
      low: tick.k.low,
      close: tick.k.close,
    })
  }, [tick, ready])

  const title = useMemo(() => `${symbol} • ${interval.toUpperCase()} 实时K线`, [symbol, interval])

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      <div className="text-lg font-semibold">{title}</div>
      <div ref={containerRef} className="w-full grow rounded-2xl border border-white/10" style={{ height: '500px' }} />
      <div className="text-xs opacity-70">数据来源：Binance WebSocket + REST</div>
    </div>
  )
}
