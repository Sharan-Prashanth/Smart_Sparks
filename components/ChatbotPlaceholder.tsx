"use client"

import { MessageCircle } from "lucide-react"

export default function ChatbotPlaceholder() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110">
        <MessageCircle className="h-6 w-6" />
      </button>
      {/* TODO: Integrate AI chatbot functionality here */}
      {/* Placeholder for AI-powered customer support chatbot */}
    </div>
  )
}
