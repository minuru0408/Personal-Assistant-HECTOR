"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight } from "lucide-react"

export default function Component() {
  const [language, setLanguage] = useState("English")

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Main heading */}
        <h1 className="text-2xl font-medium text-orange-500">
          {"Let's confirm you are"}
          <br />
          human
        </h1>

        {/* Description text */}
        <p className="text-gray-700 text-sm leading-relaxed max-w-xs mx-auto">
          Complete the security check before continuing. This step verifies that you are not a bot, which helps to
          protect your account and prevent spam.
        </p>

        {/* Begin button */}
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-sm font-medium"
          onClick={() => {
            // Handle begin action
            console.log("Begin verification")
          }}
        >
          Begin
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>

        {/* Language selector */}
        <div className="pt-4">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 mx-auto border-gray-300 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Español</SelectItem>
              <SelectItem value="French">Français</SelectItem>
              <SelectItem value="German">Deutsch</SelectItem>
              <SelectItem value="Chinese">中文</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
