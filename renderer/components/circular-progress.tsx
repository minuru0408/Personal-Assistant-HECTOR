interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 2,
  color = "#ef4444",
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${(value / 100) * circumference} ${circumference}`

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center mx-0 my-0">
          <span className="text-white font-mono text-sm">{value}</span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-400 mt-1 font-mono">{label}</span>}
    </div>
  )
}
