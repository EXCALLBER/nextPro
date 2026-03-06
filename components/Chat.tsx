"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Chat({ userEmail, userId }: { userEmail: string; userId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. 初始加载消息并订阅实时更新
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50)
      if (data) setMessages(data)
    }

    fetchMessages()

    // 订阅 messages 表的任何变化
    const channel = supabase
      .channel("realtime-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // 2. 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const { error } = await supabase.from("messages").insert({
      content: newMessage,
      user_id: userId,
      user_email: userEmail,
    })

    if (error) console.error("Send error:", error)
    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-[400px] w-full max-w-lg bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
      <div className="bg-indigo-600/50 p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          实时群聊室 (Limit: 5 Users)
        </h3>
        <span className="text-indigo-200 text-xs">实时推送中</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.user_id === userId ? "items-end" : "items-start"}`}>
            <span className="text-[10px] text-gray-400 mb-1">{msg.user_email.split("@")[0]}</span>
            <div className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
              msg.user_id === userId ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white/20 text-white rounded-tl-none border border-white/10"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-black/20 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-full transition-colors">
          <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}
