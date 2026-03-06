import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 使用 .trim() 移除可能存在的空格
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()!

  return createBrowserClient(supabaseUrl, supabaseKey)
}
