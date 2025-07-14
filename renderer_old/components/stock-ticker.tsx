import { TrendingUp, TrendingDown } from "lucide-react"
import { MiniChart } from "./mini-chart"

export function StockTicker() {
  const stocks = [
    { symbol: "AAPL", price: 185.42, change: 2.34, data: [180, 182, 181, 185, 184, 185.42] },
    { symbol: "GOOGL", price: 142.56, change: -1.23, data: [145, 144, 143, 142, 141, 142.56] },
    { symbol: "TSLA", price: 248.73, change: 5.67, data: [240, 245, 243, 248, 247, 248.73] },
  ]

  return (
    <div className="space-y-3">
      {stocks.map((stock) => (
        <div key={stock.symbol} className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-white font-mono text-sm">{stock.symbol}</span>
              {stock.change > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
            </div>
            <div className="text-xs text-gray-400">${stock.price}</div>
            <div className={`text-xs ${stock.change > 0 ? "text-green-400" : "text-red-400"}`}>
              {stock.change > 0 ? "+" : ""}
              {stock.change}
            </div>
          </div>
          <div className="w-16">
            <MiniChart data={stock.data} color={stock.change > 0 ? "#22c55e" : "#ef4444"} height={30} />
          </div>
        </div>
      ))}
    </div>
  )
}
