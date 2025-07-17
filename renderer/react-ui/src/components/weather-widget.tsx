import { Cloud, Sun, CloudRain } from "lucide-react"

export function WeatherWidget() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sun className="w-6 h-6 text-yellow-400" />
          <div>
            <div className="text-2xl font-mono text-white">72°F</div>
            <div className="text-xs text-gray-400">San Francisco</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <Sun className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <div className="text-white">75°</div>
          <div className="text-gray-400">Mon</div>
        </div>
        <div className="text-center">
          <Cloud className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <div className="text-white">68°</div>
          <div className="text-gray-400">Tue</div>
        </div>
        <div className="text-center">
          <CloudRain className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <div className="text-white">65°</div>
          <div className="text-gray-400">Wed</div>
        </div>
      </div>
    </div>
  )
}
