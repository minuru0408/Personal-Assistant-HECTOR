import { Cpu, HardDrive, Wifi } from "lucide-react"
import { CircularProgress } from "./circular-progress"

export function SystemStats() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <CircularProgress value={45} color="#ef4444" size={50} />
        <div className="text-xs text-gray-400 mt-2 flex items-center justify-center">
          <Cpu className="w-3 h-3 mr-1" />
          CPU
        </div>
      </div>
      <div className="text-center">
        <CircularProgress value={72} color="#3b82f6" size={50} />
        <div className="text-xs text-gray-400 mt-2 flex items-center justify-center">
          <HardDrive className="w-3 h-3 mr-1" />
          Storage
        </div>
      </div>
      <div className="text-center">
        <CircularProgress value={89} color="#22c55e" size={50} />
        <div className="text-xs text-gray-400 mt-2 flex items-center justify-center">
          <Wifi className="w-3 h-3 mr-1" />
          Network
        </div>
      </div>
    </div>
  )
}
