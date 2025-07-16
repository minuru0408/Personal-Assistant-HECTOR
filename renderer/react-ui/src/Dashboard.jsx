import React, { useState } from "react"
import "./Dashboard.css"

import { DashboardCard } from "./components/dashboard-card"
import { WeatherWidget } from "./components/weather-widget"
import { StockTicker } from "./components/stock-ticker"
import { CalendarWidget } from "./components/calendar-widget"
import { FinanceOverview } from "./components/finance-overview"
import { ChatAssistant } from "./components/chat-assistant"
import { SystemStats } from "./components/system-stats"
import { CircularProgress } from "./components/circular-progress"
import { MiniChart } from "./components/mini-chart"
import { AIOrb } from "./components/ai-orb"
import { VolumeControl } from "./components/volume-control" // New import

export default function Dashboard() {
  const [assistantState, setAssistantState] = useState("idle")
  const activityData = [12, 19, 15, 25, 22, 18, 28, 24, 20, 16, 21, 19]

  return (
    <div className="min-h-screen bg-black text-white p-4 overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #ef4444 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono text-red-400 tracking-wider">HECTOR </h1>
            <p className="text-xs text-gray-400 font-mono">{new Date().toLocaleString()}</p>
          </div>
          <div className="flex space-x-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse px-0 py-0 my-1 mx-0" />
            <span className="text-xs text-gray-400 font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Left Column */}
        <div className="col-span-3 space-y-4">
          <DashboardCard title="Weather" glowColor="blue" className="h-fit">
            <WeatherWidget />
          </DashboardCard>

          <DashboardCard title="Calendar" glowColor="green" className="h-fit">
            <CalendarWidget />
          </DashboardCard>

          <DashboardCard title="System Status" glowColor="purple" className="h-fit">
            <SystemStats />
          </DashboardCard>

          <DashboardCard title="Activity" glowColor="blue" className="h-32">
            <div className="flex items-end justify-center h-20">
              <MiniChart data={activityData} color="#3b82f6" height={60} />
            </div>
          </DashboardCard>

          <DashboardCard title="Performance" glowColor="green" className="h-32">
            <div className="flex justify-center items-center gap-x-0 mx-0 my-0 px-0 py-0 w-72 h-12">
              <CircularProgress value={87} color="#22c55e" size={70} label="Efficiency" />
            </div>
          </DashboardCard>
        </div>

        {/* Center Column */}
        <div className="col-span-6 space-y-4">
          {/* AI Orb - Central focal point */}
          <DashboardCard title="AI Assistant Core" className="h-80 flex items-center justify-center">
            <AIOrb state={assistantState} size={280} />
          </DashboardCard>

          <DashboardCard title="AI Chat" className="h-64">
            <ChatAssistant onAssistantStateChange={setAssistantState} />
          </DashboardCard>
        </div>

        {/* Right Column */}
        <div className="col-span-3 space-y-4">
          <DashboardCard title="Market Data" glowColor="red" className="h-fit">
            <StockTicker />
          </DashboardCard>

          <DashboardCard title="Finances" glowColor="green" className="h-fit">
            <FinanceOverview />
          </DashboardCard>

          <DashboardCard title="Quick Stats" className="h-fit">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-mono text-white">24</div>
                <div className="text-xs text-gray-400">Tasks</div>
              </div>
              <div>
                <div className="text-lg font-mono text-white">8.5h</div>
                <div className="text-xs text-gray-400">Focus</div>
              </div>
              <div>
                <div className="text-lg font-mono text-white">92%</div>
                <div className="text-xs text-gray-400">Health</div>
              </div>
              <div>
                <div className="text-lg font-mono text-white">15</div>
                <div className="text-xs text-gray-400">Goals</div>
              </div>
            </div>
          </DashboardCard>
          {/* New Volume Control Widget */}
          <DashboardCard title="Volume Control" glowColor="blue" className="h-fit">
            <VolumeControl />
          </DashboardCard>
        </div>
      </div>
    </div>
  )
}
