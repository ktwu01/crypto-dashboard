import { useEffect, useRef, useState } from 'react'

export type RealtimeKline = {
  eventTime: number
  k: {
    start: number
    end: number
    interval: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    isFinal: boolean
  }
}

export function useBinanceKline(symbol = 'btcusdt', interval = '1m') {
  const [tick, setTick] = useState<RealtimeKline | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const stream = `${symbol}@kline_${interval}`
    const url = `wss://stream.binance.com:9443/ws/${stream}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data)
      setTick({
        eventTime: d.E,
        k: {
          start: d.k.t,
          end: d.k.T,
          interval: d.k.i,
          open: parseFloat(d.k.o),
          high: parseFloat(d.k.h),
          low: parseFloat(d.k.l),
          close: parseFloat(d.k.c),
          volume: parseFloat(d.k.v),
          isFinal: d.k.x,
        },
      })
    }

    ws.onclose = () => {
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          wsRef.current = null
        }
      }, 1000)
    }

    return () => ws.close()
  }, [symbol, interval])

  return tick
}
