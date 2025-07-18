import { Calendar } from "lucide-react"

export function CalendarWidget() {
  const today = new Date()
  const events = [
    { time: "09:00", title: "Team Meeting", color: "red" },
    { time: "14:30", title: "Client Call", color: "blue" },
    { time: "16:00", title: "Project Review", color: "green" },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 mb-3">
        <Calendar className="w-4 h-4 text-red-400" />
        <span className="text-white font-mono text-sm">
          {today.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="text-xs text-gray-400 font-mono w-12">{event.time}</div>
            <div className={`w-2 h-2 rounded-full bg-${event.color}-400`} />
            <div className="text-xs text-white flex-1">{event.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
