"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // 简单探测 Supabase 网络是否通畅
      console.log("Checking connection to:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase Error Response:", error)
        setError(error.message)
        setLoading(false)
      } else {
        console.log("Login Success:", data)
        router.push("/")
        setTimeout(() => router.refresh(), 1000)
      }
    } catch (err: any) {
      console.error("Network or Unexpected Error:", err)
      setError("Network error: Could not reach Supabase. Please check your internet or VPN.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign In with Supabase</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="relative block w-full rounded-t-md border border-gray-300 px-3 py-2"
              placeholder="Email address"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="relative block w-full rounded-b-md border border-gray-300 px-3 py-2"
              placeholder="Password"
            />
          </div>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="text-center">
          <Link href="/register" className="text-sm font-medium text-indigo-600">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  )
}
