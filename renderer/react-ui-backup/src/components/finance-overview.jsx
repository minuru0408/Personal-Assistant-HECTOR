import { TrendingUp } from "lucide-react"
import { CircularProgress } from "./circular-progress"

export function FinanceOverview() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Balance</div>
          <div className="text-lg font-mono text-white">$12,450</div>
          <div className="text-xs text-green-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            +2.3%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Expenses</div>
          <div className="text-lg font-mono text-white">$3,240</div>
          <div className="text-xs text-red-400">This month</div>
        </div>
      </div>

      <div className="flex justify-center">
        <CircularProgress value={68} color="#22c55e" label="Budget Used" size={60} />
      </div>
    </div>
  )
}
