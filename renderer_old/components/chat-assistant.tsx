"use client"

import { useState } from "react"
import { Send, Bot, User, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: number
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

interface ChatAssistantProps {
  onAssistantStateChange?: (state: "idle" | "listening" | "talking") => void
}

export function ChatAssistant({ onAssistantStateChange }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Good evening! How can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Set assistant to listening state
    onAssistantStateChange?.("listening")

    // Simulate assistant thinking/responding
    setIsTyping(true)
    setTimeout(() => {
      onAssistantStateChange?.("talking")

      const assistantMessage: Message = {
        id: Date.now() + 1,
        text: "I understand. Let me help you with that.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Simulate talking duration
      setTimeout(() => {
        setIsTyping(false)
        onAssistantStateChange?.("idle")
      }, 2000)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-3 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender === "assistant" && <Bot className="w-4 h-4 text-red-400 mt-1" />}
            <div
              className={`max-w-[80%] p-2 rounded text-xs ${
                message.sender === "user" ? "bg-red-500/20 text-white" : "bg-gray-800/50 text-gray-300"
              }`}
            >
              {message.text}
            </div>
            {message.sender === "user" && <User className="w-4 h-4 text-blue-400 mt-1" />}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start space-x-2">
            <Bot className="w-4 h-4 text-red-400 mt-1" />
            <div className="bg-gray-800/50 text-gray-300 p-2 rounded text-xs">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-gray-700/50 border-t border-b-0 border-l-0 pt-2 pb-0 mx-0 my-0 pl-0 pr-2 border-r-0">
        <div className="flex space-x-3 mx-0 my-0 py-0 px-0 border-0 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 bg-black/30 border-gray-600/50 text-white text-sm placeholder:text-gray-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 mx-0 my-5 py-0 px-2 border-0"
          />
          <Button
            onClick={() => {
              // Handle voice input action
              console.log("Voice input activated")
              onAssistantStateChange?.("listening")
              setTimeout(() => onAssistantStateChange?.("idle"), 2000) // Simulate listening
            }}
            size="sm"
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 px-4"
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            onClick={sendMessage}
            size="sm"
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
