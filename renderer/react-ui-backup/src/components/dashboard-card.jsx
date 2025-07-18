import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  children: ReactNode
  className?: string
  title?: string
  glowColor?: "red" | "blue" | "green" | "purple"
}

export function DashboardCard({ children, className, title, glowColor = "red" }: DashboardCardProps) {
  const glowClasses = {
    red: "border-red-500/30 shadow-red-500/20",
    blue: "border-blue-500/30 shadow-blue-500/20",
    green: "border-green-500/30 shadow-green-500/20",
    purple: "border-purple-500/30 shadow-purple-500/20",
  }

  return (
    <div
      className={cn("bg-black/40 backdrop-blur-sm border rounded-lg p-4 shadow-lg", glowClasses[glowColor], className)}
    >
      {title && <h3 className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider">{title}</h3>}
      {children}
    </div>
  )
}
