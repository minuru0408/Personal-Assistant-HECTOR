"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Volume1, Volume2, VolumeX } from "lucide-react"

export function VolumeControl() {
  const [volume, setVolume] = useState(50)

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2

  return (
    <div className="flex flex-col items-center space-y-4 p-2">
      <div className="flex items-center space-x-3 w-full">
        <VolumeIcon className="w-5 h-5 text-gray-400" />
        <Slider
          defaultValue={[volume]}
          max={100}
          step={1}
          onValueChange={(val) => setVolume(val[0])}
          className="flex-1 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:border-red-500 [&::-webkit-slider-thumb]:shadow-red-500/50 [&::-webkit-slider-thumb]:hover:bg-red-600 [&::-webkit-slider-thumb]:hover:border-red-600 [&::-webkit-slider-thumb]:focus:ring-red-500"
        />
        <span className="text-sm font-mono text-white w-8 text-right">{volume}%</span>
      </div>
    </div>
  )
}
