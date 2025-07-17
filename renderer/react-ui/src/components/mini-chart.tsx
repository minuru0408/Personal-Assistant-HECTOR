interface MiniChartProps {
  data: number[]
  color?: string
  height?: number
}

export function MiniChart({ data, color = "#ef4444", height = 40 }: MiniChartProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  return (
    <div className="flex items-end space-x-3.5 mx-0 my-4" style={{ height }}>
      {data.map((value, index) => {
        const normalizedHeight = range > 0 ? ((value - min) / range) * height : height / 2
        return (
          <div
            key={index}
            className="w-1 transition-all duration-300"
            style={{
              height: `${normalizedHeight}px`,
              backgroundColor: color,
              opacity: 0.8,
            }}
          />
        )
      })}
    </div>
  )
}
